select current_schema;

CREATE EXTENSION pgcrypto;

CREATE TABLE posts (
	"id"							UUID					NOT NULL,
	"user_id"					UUID					NOT NULL,
	"ip"							cidr					NOT NULL,
	"content"					varchar(500)	NOT NULL,
	"privacy"					integer				NOT NULL,
	"nsfw"						boolean				NOT NULL,
	"cw"							boolean				NOT NULL,
	"created_at"			timestamp			NOT NULL,
	"like"						integer				NOT NULL,
	"dislike"					integer				NOT NULL,
	"liked_users"			UUID[]				NOT NULL,
	"disliked_users"	UUID[]				NOT NULL
);

CREATE TABLE users (
	"id"							UUID					NOT NULL,
	"mail"						varchar(64)		NOT NULL,
	"pass"						varchar(128)	NOT NULL,
	-- twitter style: username@usertag
	"username"				varchar(32)		NOT NULL,
	"usertag"					varchar(18)		NOT NULL UNIQUE,
	"registered_at"		timestamp			NOT NULL,
	"verified"				boolean				NOT NULL,
	"total_posts"			integer				NOT NULL,
	"like"						integer				NOT NULL,
	"dislike"					integer				NOT NULL,
	"liked_users"			UUID[]				NOT NULL,
	"disliked_users"	UUID[]				NOT NULL
);

CREATE TYPE api_posts as (
	id								UUID,
	"user_id" 				UUID,
	content						varchar(500),
	privacy						integer,
	nsfw							boolean,
	cw								boolean,
	created_at				timestamp,
	"like"						integer,
	dislike				 		integer,
	"liked_users"			UUID[],
	"disliked_users"	UUID[],
	"author"					UUID
);

CREATE TYPE api_users as (
	id							UUID,
	username				varchar(32),
	usertag					varchar(18),
	registered_at		timestamp,
	verified				boolean,
	total_posts			integer,
	"like"					integer,
	dislike				 	integer,
	"liked_users"			UUID[],
	"disliked_users"	UUID[]
);

CREATE VIEW v_users as
	SELECT
		id,
		username,
		usertag,
		registered_at,
		verified,
		total_posts,
		"like",
		dislike,
		"liked_users",
		"disliked_users"
	FROM users;

CREATE VIEW v_posts as
	SELECT
		id,
		"user_id",
		content,
		privacy,
		nsfw,
		cw,
		created_at,
		"like",
		dislike,
		"liked_users",
		"disliked_users"
	FROM posts;

CREATE FUNCTION getUser(id UUID)
	returns api_users AS $$
	SELECT
		id,
		username,
		usertag,
		registered_at,
		verified,
		total_posts,
		"like",
		dislike,
		"liked_users",
		"disliked_users"
	FROM users
	WHERE id=$1 LIMIT 1;
$$ LANGUAGE SQL;

CREATE FUNCTION getPost(id UUID)
	returns api_posts AS $$
	SELECT
		id,
		"user_id",
		content,
		privacy,
		nsfw,
		cw,
		created_at,
		"like",
		dislike,
		liked_users,
		disliked_users,
		"user_id" as author
	FROM posts
	WHERE id=$1 LIMIT 1;
$$ LANGUAGE SQL;

CREATE FUNCTION searchPost(q text,max integer = 100) RETURNS api_posts AS $$
	select
		id,
		"user_id",
		content,
		privacy,
		nsfw,
		cw,
		created_at,
		"like",
		dislike,
		"liked_users",
		"disliked_users",
		"user_id" as author
	from  posts
	where content like any (
		select '%' || replace(replace(replace(_.text,'%','\%'),'_','\_'),'*','%') || '%'
		from (
			select regexp_split_to_table($1,' ') as text
		) _
	)
	LIMIT $2;
$$ LANGUAGE SQL;