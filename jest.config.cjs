/** @type {import("jest").Config} */
// module.exports = {
//     preset: "ts-jest",
//     testEnvironment: "node",
//     transform: {
//         "^.+\\.tsx?$": [
//             "ts-jest",
//             {
//                 useESM: false,
//                 tsconfig: {
//                     module: "CommonJS"
//                 }
//             }
//         ]
//     }
// };

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.jest.json",
            },
        ],
    },
};
