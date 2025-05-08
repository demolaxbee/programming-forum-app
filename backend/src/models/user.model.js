module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    level: {
      type: DataTypes.ENUM('Beginner', 'Intermediate', 'Expert'),
      defaultValue: 'Beginner'
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  User.associate = (models) => {
    User.hasMany(models.Channel, {
      foreignKey: 'userId',
      as: 'channels',
      onDelete: 'SET NULL'
    });
    
    User.hasMany(models.Message, {
      foreignKey: 'userId',
      as: 'messages',
      onDelete: 'SET NULL'
    });
    
    User.hasMany(models.Reply, {
      foreignKey: 'userId',
      as: 'replies',
      onDelete: 'SET NULL'
    });
    
    User.hasMany(models.Rating, {
      foreignKey: 'userId',
      as: 'ratings',
      onDelete: 'SET NULL'
    });
  };

  return User;
}; 