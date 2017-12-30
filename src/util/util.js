import axios from "axios";

const util = {
    getData (url, callback) {
        const config = {
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate"
            },
            params: {
                format: "json",
                nocache: true
            }
        };

        axios.get(url, config)
            .then((response) => {
                callback(response);
            })
            .catch((error) => {
                callback({ error });
            });
    },
    toArray (array) {
        return [].slice.call(array);
    },
    dup (array) {
        return array.filter((elem, index, self) => {
            return index === self.indexOf(elem);
        });
    },
    generateUID () {
        let firstPart = (Math.random() * 46656) | 0;
        let secondPart = (Math.random() * 46656) | 0;

        firstPart = (`000${ firstPart.toString(36)}`).slice(-3);
        secondPart = (`000${ secondPart.toString(36)}`).slice(-3);
        return firstPart + secondPart;
    },
    slugify (value) {
        return value.toString().toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
            .replace(/--+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");
    }
};

export default util;