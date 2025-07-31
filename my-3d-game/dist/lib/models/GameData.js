"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
var db_1 = require("../db");
var User_1 = require("./User");
var GameData = /** @class */ (function (_super) {
    __extends(GameData, _super);
    function GameData() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GameData;
}(sequelize_1.Model));
GameData.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User_1.default,
            key: 'id',
        },
    },
    level: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isIn: [['easy', 'medium', 'hard']],
        },
    },
    time: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    progress: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: 'createdAt',
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: 'updatedAt',
    },
}, {
    sequelize: db_1.default,
    modelName: 'GameData',
    tableName: 'GameData',
    timestamps: true,
});
exports.default = GameData;
