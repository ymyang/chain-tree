/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Sequence', { 
    seqName: {
      field: 'seq_name',
      primaryKey: true,
      type: DataTypes.STRING,
      allowNull: false
    },
    seqValue: {
      field: 'seq_value',
      type: DataTypes.BIGINT,
      allowNull: false
    }
  } , {
    tableName: 'sequence',
    timestamps: false,
    freezeTableName: true
  });
};
