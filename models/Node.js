/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Node', { 
    nodeId: {
      field: 'node_id',
      primaryKey: true,
      type: DataTypes.BIGINT,
      allowNull: false
    },
    parentId: {
      field: 'parent_id',
      type: DataTypes.BIGINT,
      allowNull: true
    },
    parentIds: {
      field: 'parent_ids',
      type: DataTypes.STRING,
      allowNull: false
    },
    layer: {
      field: 'layer',
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    nodeName: {
      field: 'node_name',
      type: DataTypes.STRING,
      allowNull: false
    },
    orderValue: {
      field: 'order_value',
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  } , {
    tableName: 'node',
    timestamps: false,
    freezeTableName: true
  });
};
