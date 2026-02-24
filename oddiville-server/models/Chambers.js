module.exports = (sequelize, Sequelize) => {
  const Chamber = sequelize.define("Chambers", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    chamber_name: {
      type: Sequelize.STRING,
      allowNull: false,
      set(value) {
  this.setDataValue("chamber_name", value.trim().toLowerCase());
}

    },
    capacity: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    items: {
      type: Sequelize.ARRAY(Sequelize.UUID)
    },
    tag: {
      type: Sequelize.ENUM("frozen", "dry"),
      defaultValue: "frozen"
    }
  }, {
    timestamps: true,

    indexes: [
      {
  unique: true,
  fields: ["chamber_name"]
},   
      { fields: ["tag"] },             // dry/frozen filter
    ]
  }
);

  Chamber.associate = (db) => {
   Chamber.hasMany(db.DryWarehouse, {
  foreignKey: "chamber_id",
  as: "dryWarehouses",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
  hooks: true
});

  };

  return Chamber;
};