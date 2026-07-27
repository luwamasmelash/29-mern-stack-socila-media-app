export const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth();

        console.log("AUTH USER:", userId);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Not Authenticated"
            });
        }

        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};