create extension if not exists postgis;

create table if not exists users (
	id varchar(128) primary key,
	username varchar(255) not null,
	email varchar(255),
	"photoUrl" text,
	json json[]
);
