const express = require('express');
const router = express.Router();

router.get("/", (req,res) => {
    const urls = [
        {origin: "www.google.com/bluuweb1", shortUrl: "akdkdl1"},
        {origin: "www.google.com/bluuweb2", shortUrl: "akdkdl2"},
        {origin: "www.google.com/bluuweb3", shortUrl: "akdkdl3"},
    ]
    res.render("home",{urls: urls});
})

module.exports = router;