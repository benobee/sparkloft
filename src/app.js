import collectionlistController from "./core/collectionlistController";

/**
 * App shell pattern. Looks for specific classnames
 * in the body, stores the HTML and executes init scripts.
 *
 * @type {Object}
 * @name App
 */

const App = {
    init () {
        this.cacheDOM();
        this.execute();
    },
    cacheDOM () {
        this.portfolio = document.querySelector(".collection-type-portfolio.view-list");
        this.blog = document.querySelector("#collection-5a345e48e4966b79a087b76f");
    },
    execute () {
        if (this.portfolio) {
            collectionlistController.init(this.portfolio, {
                title: false
            });
        }
        if (this.blog) {
            collectionlistController.init(this.blog, {
                excerpt: false
            });
        }
    }
};

window.onload = App.init();