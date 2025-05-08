module.exports = (sequelize, DataTypes) => {
  const Reply = sequelize.define("Reply", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parentReplyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Replies',
        key: 'id'
      }
    }
  });

  Reply.associate = (models) => {
    Reply.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author'
    });
    
    Reply.belongsTo(models.Message, {
      foreignKey: 'messageId',
      as: 'message'
    });
    
    Reply.belongsTo(models.Reply, {
      foreignKey: 'parentReplyId',
      as: 'parentReply'
    });
    
    Reply.hasMany(models.Reply, {
      foreignKey: 'parentReplyId',
      as: 'childReplies'
    });
    
    Reply.hasMany(models.Rating, {
      foreignKey: 'targetId',
      scope: {
        targetType: 'reply'
      },
      as: 'ratings'
    });
  };

  return Reply;
}; 