select current_schema;

CREATE EXTENSION pgcrypto;

CREATE TABLE posts (
	"id"							UUID					NOT NULL,
	"user_id"					UUID					NOT NULL,
	"ip"							cidr					NOT NULL,
	"content"					varchar(500)	NOT NULL,
	"card"						JSON,
	"privacy"					integer				NOT NULL,
	"nsfw"						boolean				NOT NULL,
	"cw"							boolean				NOT NULL,
	"created_at"			timestamp			NOT NULL,
	"like"						integer				NOT NULL,
	"dislike"					integer				NOT NULL,
	"liked_users"			UUID[],
	"disliked_users"	UUID[]
);

CREATE TABLE users (
	"id"						UUID					NOT NULL,
	"mail"					varchar(256)	NOT NULL,
	"pass"					varchar(128)	NOT NULL,
	-- twitter style: username@usertag
	"username"			varchar(64)		NOT NULL,
	"usertag"				varchar(64)		NOT NULL UNIQUE,
	"registered_at"	timestamp			NOT NULL,
	"like"					integer				NOT NULL,
	"dislike"				integer				NOT NULL,
	"totalPosts"		integer				NOT NULL
);

FOR i IN 1..100 LOOP

	INSERT INTO users (
		id,mail,
		pass,username,usertag,
		registered_at,"like",dislike,
		totalPosts
	) VALUES (
		gen_random_uuid(),
		'alpha' || i::text,
		digest(gen_random_uuid(),"sha256"),
		'alpha' || i::text,
		'alpha' || i::text,
		current_timestamp,
		0,
		0,
		0
	);

END LOOP;