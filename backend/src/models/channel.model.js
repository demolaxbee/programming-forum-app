module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define("Channel", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    }
  });

  Channel.associate = (models) => {
    Channel.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'creator'
    });
    
    Channel.hasMany(models.Message, {
      foreignKey: 'channelId',
      as: 'messages'
    });
  };

  return Channel;
}; 