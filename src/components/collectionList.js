import itemHTML from "./collectionList.html";
import util from "../util/util";

/**
 * Vue component config for infinite scrolling
 * and list filtering
 *
 * @param  {Object} data   from site collection
 * @param  {Object} events pub sub events
 * @returns {Object}        compiled vue object config
 */

const collectionList = (data, events, collectionName, userDisplayOptions) => {
    return {
        template: itemHTML,
        data () {
            let pagination = false;

            if (data.pagination) {
                pagination = data.pagination;
            }

            const displayOptions = {
                image: true,
                title: true,
                excerpt: true
            };

            if (userDisplayOptions) {
                Object.assign(displayOptions, userDisplayOptions);
            }

            return {
                fullUrl: data.collection.fullUrl,
                items: data.items,
                scrollHeight: 0,
                currentItems: [],
                scrollBottom: false,
                pagination,
                displayOptions,
                isLoading: false,
                lifecycle: {
                    appLoaded: false
                }
            };
        },
        filters: {

            /**
             * Useful classnames for rendered items.
             *
             * @private
             */

            applyItemClasses (item) {
                const itemClassNames = [];

                if (item.categories) {
                    item.hasCategories = true;
                    itemClassNames.push("has-categories");
                    itemClassNames.push(item.categories.map((category) => `category-${category.toLowerCase()}`).join(" "));
                }

                if (item.colorData) {
                    itemClassNames.push("has-image");
                } else {
                    itemClassNames.push("no-image");
                }

                return itemClassNames.join(" ");
            },


            /**
             * Formats the image url to the available
             * squarespace resolutions.
             *
             * @param  {Object} width
             * @returns {String}
             * @private
             */

            suggestedColor (colorData) {
                return {
                    backgroundColor: `#${colorData.suggestedBgColor}`
                };
            },

            formatSmall (img) {
                return `${img }?format=300w`;
            }
        },
        computed: {
            isScrolling () {
                let scrolling = false;

                if (this.scrollHeight < this.listTop) {
                    scrolling = true;
                }

                return scrolling;
            },
            appLoaded () {
                let className = "";

                if (this.lifecycle.appLoaded) {
                    className = "data-loaded";
                }

                return className;
            }
        },
        directives: {
            loadImage: {
                inserted (img) {
                    img.onload = function () {
                        img.setAttribute("data-image-loaded", true);
                    };
                }
            }
        },
        methods: {
            bindScrollEvents () {
                window.addEventListener("load", this.executeScrollFunctions);
                window.addEventListener("scroll", this.executeScrollFunctions);
            },
            cleanupScrollEvents () {
                window.removeEventListener("load", this.executeScrollFunctions);
                window.removeEventListener("scroll", this.executeScrollFunctions);
            },

            /**
             * Tests whether the collection list is at the bottom or not.
             *
             * @private
             */

            executeScrollFunctions () {
                const grid = this.$el.querySelector("#collection-items-vue .collection-list");
                const height = window.innerHeight;
                const domRect = grid.getBoundingClientRect();
                const triggerAmount = height - domRect.bottom;
                const body = document.body.getBoundingClientRect();

                this.scrollHeight = body.top;

                //show next page of pagination list
                this.appendItems(triggerAmount);
            },

            /**
             * when the page is scrolled to the bottom of the current items
             * the next set or page of items will be auto appened to the bottom
             *
             * @param  {Number} triggerAmount
             * @private
             */

            appendItems (triggerAmount) {
                if (triggerAmount > 0 && !this.scrollBottom && this.pagination) {
                    this.isLoading = true;
                    util.getData(this.pagination.nextPageUrl, (response) => {
                        if (response.data.pagination && response.data.pagination.nextPage) {
                            this.pagination = response.data.pagination;
                        }
                        this.items = this.items.concat(response.data.items);
                        this.isLoading = false;
                    });
                    this.scrollBottom = false;
                    this.pagination = false;
                }
            },

            filterByCategory (filter) {
                let url = this.fullUrl;

                this.pagination = false;

                if (filter.filterName !== "All" && filter) {
                    url = `${this.fullUrl}?category=${filter.filterName}`;
                }

                util.getData(url, (response) => {
                    this.items = response.data.items;

                    if (response.data.pagination) {
                        this.pagination = response.data.pagination;
                        this.scrollBottom = false;
                    }
                    this.progressLoaderIsActive(false);
                });
            },

            /**
             * A well mannered tale about the history of the browser
             * from page to page that changes categories by the last
             * filter in the state object.
             *
             * @private joke
             */

            listenToHistoryLesson () {
                //set initial history state
                window.addEventListener("popstate", (e) => {
                    if (e.state.currentFilter) {
                        events.emit("filter-set", { filterName: e.state.currentFilter, popstate: true });
                    }
                });
            },

            progressLoaderIsActive (bool) {
                if (bool) {
                    document.querySelector(".progress-loader").classList.remove("load-complete");
                } else {
                    document.querySelector(".progress-loader").classList.add("load-complete");
                }
            },

            getUrlParameter (name) {
                name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");

                const regex = new RegExp(`[\\?&]${ name }=([^&#]*)`);
                const results = regex.exec(location.search);

                return results === null ? "" : decodeURIComponent(results[ 1 ].replace(/\+/g, " "));
            },

            checkUrlForFilter () {
                const search = this.getUrlParameter("category");

                if (search) {
                    this.filterByCategory({ filterName: search });
                    events.emit("filter-set", { filterName: search });
                } else {
                    events.emit("filter-set", { filterName: "All" });
                    history.pushState({ currentFilter: "All" }, null, `/${collectionName}`);
                }
            },

            encodeShareUrl (value) {
                return `/${collectionName}?category=${encodeURIComponent(value)}`;
            }
        },
        mounted () {
            this.progressLoaderIsActive(true);
            this.checkUrlForFilter();
            this.listenToHistoryLesson();
            events.on("filter-set", (e) => {
                if (!e.popstate) {
                    if (e.filterName === "All") {
                        history.pushState({ currentFilter: "All" }, null, `/${collectionName}`);
                    } else {
                        history.pushState({ currentFilter: e.filterName }, null, this.encodeShareUrl(e.filterName));
                    }
                }

                this.progressLoaderIsActive(true);

                setTimeout(() => {
                    this.filterByCategory(e);
                }, 600);
            });

            setTimeout(() => {
                this.lifecycle.appLoaded = true;
                this.bindScrollEvents();
                this.progressLoaderIsActive(false);
            }, 600);
        }
    };
};

export default collectionList;