import axios from "axios";

export default {
    post: (path, body, token) => {
        return new Promise((resolve, reject) => {
            axios
                .post(
                    path,
                    body,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: token
                        }
                    }
                )
                .then(response => {
                    resolve(response)
                })
                .catch(error => {
                    reject(error.response)
                });
        })

    }
}