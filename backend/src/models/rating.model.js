module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define("Rating", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[-1, 1]]  // Only allow -1 (downvote) or 1 (upvote)
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    targetType: {
      type: DataTypes.ENUM('message', 'reply'),
      allowNull: false
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Rating.associate = (models) => {
    Rating.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Rating;
}; 