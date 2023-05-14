const jwt = require("jsonwebtoken");
const Users = require("../models/users.model");


const authentication = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const token = authHeader.split(" ")[1];
        // console.log(token);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token not authorized"
            });
        }

        const payLoad = jwt.verify(token, process.env.JWT_SECRET);

        console.log(payLoad.id);

        if (!payLoad) {
            return res.status(403).json({
                success: false,
                message: "forbidden"
            });
        }

        const { id } = payLoad;

        // console.log(id);


        const user = await Users.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            });
        }

        req.user = user;

        next();

    } catch (err) {
        console.log(err);
        return res.status(403).json({
            success: false,
            message: "session expired"
        });
    }
}

const isAdmin = async (req, res, next) => {

    try {
        const authHeader = req.headers.authorization;
        console.log(authHeader);
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const token = authHeader.split(" ")[1];
        console.log(token);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token not authorized"
            });
        }

        const payLoad = jwt.verify(token, process.env.JWT_SECRET);
        console.log(payLoad);

        if (!payLoad) {
            return res.status(403).json({
                success: false,
                message: "forbidden"
            });
        }

        const { id } = payLoad;

        // console.log(id);

        const user = await Users.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            });
        }

        if (user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "forbidden"
            });
        }

        req.user = user;

        next();

    } catch (err) {
        console.log(err);
        return res.status(403).json({
            success: false,
            message: "session expired"
        });
    }

}

const customerAuth = async (req, res, next) => {

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }


        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token not authorized"
            });
        }

        const payLoad = jwt.verify(token, process.env.JWT_SECRET);

        if (!payLoad) {
            return res.status(403).json({
                success: false,
                message: "forbidden"
            });
        }


        const { id } = payLoad;

        const user = await Users.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            });
        }


        // if (user.role !== "ADMIN") {
        //     return res.status(403).json({
        //         success: false,
        //         message: "forbidden"
        //     });
        // }

        if(user.role === "ADMIN" || user.role === "customer"){
            console.log("role confirmed")
        } else {
            return res.status(403).json({
                        success: false,
                        message: "forbidden"
            })
        }


            req.user = user;
             next();
        

    } catch (err) {
        console.log(err);
        return res.status(403).json({
            success: false,
            message: "session expired"
        });
    }


}



module.exports = { authentication, isAdmin, customerAuth };


