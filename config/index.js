
const config = {
    urlRoot:"http://35.194.169.85",
    jwtTokenSecret: 'web360',
    port: 3000,
    mongodb: "mongodb://aaornlee1313:aaornlee1313@ds135844.mlab.com:35844/aaronlee1313",
    senderMail:{
        user:"web360sys@gmail.com",
        password:"@Pa$$w0rd"
    },
    UPLOAD_PATH:'./upload',
    EXPORT_PATH:'./export',
    TEMPLATE_PATH:'./template'
};

module.exports = config;