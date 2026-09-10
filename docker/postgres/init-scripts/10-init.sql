create extension postgis;
create extension pgrouting;

create table if not exists users (
	user_id varchar(128) primary key,
	user_name varchar(255) not null,
	user_password varchar(255),
	photo_url text
);
