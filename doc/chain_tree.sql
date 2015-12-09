/*==============================================================*/
/* Database name:  chain_tree                                   */
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2015/12/9 15:38:37                           */
/*==============================================================*/


drop database if exists chain_tree;

/*==============================================================*/
/* Database: chain_tree                                         */
/*==============================================================*/
create database chain_tree DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;

use chain_tree;

/*==============================================================*/
/* Table: node                                                  */
/*==============================================================*/
create table node
(
   node_id              bigint not null comment '节点id',
   parent_id            bigint comment '父节点id',
   parent_ids           varchar(255) binary not null comment '父节点id路径',
   layer                int not null comment '层次',
   node_name            varchar(100) not null comment '节点名',
   order_value          int not null default 0 comment '排序值'
);

alter table node
   add primary key (node_id);

/*==============================================================*/
/* Index: IX_nodet_name                                         */
/*==============================================================*/
create index IX_nodet_name on node
(
   node_name
);

/*==============================================================*/
/* Index: IX_node_order_value                                   */
/*==============================================================*/
create index IX_node_order_value on node
(
   order_value
);

/*==============================================================*/
/* Index: IX_node_parent_ids                                    */
/*==============================================================*/
create index IX_node_parent_ids on node
(
   parent_ids
);

/*==============================================================*/
/* Table: sequence                                              */
/*==============================================================*/
create table sequence
(
   seq_name             varchar(10) not null,
   seq_value            bigint not null
);

alter table sequence
   add primary key (seq_name);

alter table node add constraint FK_node_ref_parent foreign key (parent_id)
      references node (node_id) on delete cascade on update restrict;

