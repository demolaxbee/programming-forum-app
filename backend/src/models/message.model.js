module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 100]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    screenshot: {
      type: DataTypes.STRING,
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
    },
    channelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Channels',
        key: 'id'
      }
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? rawValue.split(',') : [];
      },
      set(val) {
        this.setDataValue('tags', val.join(','));
      }
    }
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author'
    });
    
    Message.belongsTo(models.Channel, {
      foreignKey: 'channelId',
      as: 'channel'
    });
    
    Message.hasMany(models.Reply, {
      foreignKey: 'messageId',
      as: 'replies'
    });
    
    Message.hasMany(models.Rating, {
      foreignKey: 'targetId',
      scope: {
        targetType: 'message'
      },
      as: 'ratings'
    });
  };

  return Message;
}; 