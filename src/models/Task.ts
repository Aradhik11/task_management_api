import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { TaskAttributes } from '../types';
import User from './User';

interface TaskCreationAttributes extends Optional<TaskAttributes, 'id' | 'createdAt' | 'updatedAt' | 'timeSpent'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public status!: 'pending' | 'in-progress' | 'completed';
  public userId!: number;
  public timeSpent!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    timestamps: true,
  }
);

// Define associations
Task.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });

export default Task;