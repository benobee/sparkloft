import html from "./image.html";

const image = {
    props: ["item"],
    data () {
        return {
            isLoaded: false,
            defaultResolution: "300w"
        };
    },
    filters: {
        suggestedColor (colorData) {
            return {
                backgroundColor: `#${colorData.suggestedBgColor}`
            };
        },
        formatSmall (img) {
            return `${img}?format=300w`;
        }
    },
    template: html,
    mounted () {
        const img = this.$el.querySelector("img");

        img.onload = () => {
            this.isLoaded = true;
        };
    }
};

export default image;