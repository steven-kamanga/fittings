const express = require("express");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const { getPrismaInstance } = require('./prisma/prisma');
const authRoutes = require("./router/auth_users.js").authenticated;
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swingAnalysisRouter = require('./router/swing_analysis');
const fittingRequestRouter = require("./router/fitting_request.js");
const adminTaskTypeRouter = require("./router/admin_task_type")
const customerRouter = express.Router();
const cors = require("cors")

const app = express();

app.use(cors({
    origin: '*',
    credentials: true,
}));


app.use(express.json());

app.use(
    "/customer",
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true,
    })
);

const PORT = process.env.PORT || 3030;
const SECRET = process.env.SECRET || "kasdkjsh9uohr4jbkasnasd0sopi()D(Sjdls;l";

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fittings API',
            version: '1.0.0',
            description: 'API for managing fittings',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./router/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};


customerRouter.use('/auth', authRoutes);
customerRouter.use('', swingAnalysisRouter);
customerRouter.use('', fittingRequestRouter);
customerRouter.use('', adminTaskTypeRouter);

app.use('/customer', customerRouter);

app.listen(PORT, () =>
    console.log(`Server running on http://127.0.0.1:${PORT}`)
);

process.on('SIGINT', async () => {
    const prisma = getPrismaInstance();
    await prisma.$disconnect();
    process.exit();
});