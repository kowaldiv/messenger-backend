create table
  users (
    id UUID primary key default uuidv7 (),
    global_role varchar(20) default 'user' check (global_role in ('user', 'moderator')) NOT NULL,
    username varchar(30) unique NOT null,
    first_name varchar(30) NOT null,
    last_name varchar(30),
    email varchar(100) unique NOT null,
    password_hash varchar(255) NOT null,
    bio varchar(100),
    last_seen timestamp NOT null,
    created_at timestamp NOT null default NOW (),
    updated_at timestamp NOT null default NOW (),
    is_banned BOOLEAN DEFAULT FALSE NOT NULL
  );

create table
  sessions (
    id UUID primary key default uuidv7 (),
    user_id UUID not null,
    token varchar(255) not null UNIQUE,
    token_type varchar(15) not null default 'refresh' check (token_type in ('refresh', 'reset_password')),
    fingerprint varchar(255) not null,
    expires_at timestamp not null,
    created_at timestamp not null default NOW (),
    constraint fk_sessions_user foreign key (user_id) references users (id) on delete cascade
  );

create table
  chats (
    id UUID primary key default uuidv7 (),
    type varchar(20) not null default 'private' check (type in ('private', 'group', 'channel')),
    title varchar(50),
    created_at timestamp not null default NOW (),
    updated_at timestamp not null default NOW ()
  );

create table
  invite_links (
    id UUID primary key default uuidv7 (),
    chat_id UUID not null,
    token varchar(255) not null,
    expires_at timestamp not null,
    created_at timestamp not null default NOW (),
    constraint fk_invite_links_chat foreign key (chat_id) references chats (id) on delete cascade
  );

create table
  channel_settings (
    chat_id UUID not null primary key,
    description varchar(300),
    is_private boolean not null default true,
    foreign key (chat_id) references chats (id) on delete cascade
  );

create table
  chat_participants (
    id UUID primary key default uuidv7 (),
    chat_id UUID not null,
    user_id UUID not null,
    role varchar(20) not null default 'member' check (role in ('member', 'moderator', 'owner')),
    joined_at timestamp not null default NOW (),
    last_read_message_time timestamp not null default NOW (),
    foreign key (chat_id) references chats (id) on delete cascade,
    foreign key (user_id) references users (id) on delete cascade
  );

create table
  avatars (
    id UUID primary key default uuidv7 (),
    entity_type varchar(10) not null check (entity_type in ('user', 'chat')),
    user_id UUID references users (id) on delete cascade,
    chat_id UUID references chats (id) on delete cascade,
    avatar_url text not null,
    is_primary boolean not null default true,
    created_at timestamp not null default NOW (),
    check (
      (
        entity_type = 'user'
        and user_id is not null
        and chat_id is null
      )
      or (
        entity_type = 'chat'
        and chat_id is not null
        and user_id is null
      )
    )
  );

create table
  reports (
    id UUID primary key default uuidv7 (),
    chat_id UUID not null,
    user_id UUID,
    reason text not null,
    status varchar(10) not null check (status in ('pending', 'resolved', 'rejected')),
    foreign key (chat_id) references chats (id) on delete cascade,
    foreign key (user_id) references users (id) on delete set null
  );

create table
  messages (
    id UUID primary key default uuidv7 (),
    chat_id UUID,
    user_id UUID,
    text text,
    reply_to_id UUID,
    is_deleted boolean not null default false,
    created_at timestamp not null default NOW (),
    edited_at timestamp not null default NOW (),
    foreign key (chat_id) references chats (id) on delete set null,
    foreign key (user_id) references users (id) on delete set null
  );

create table
  attachmenst (
    id UUID primary key default uuidv7 (),
    message_id UUID not null,
    file_url text not null,
    file_type varchar(20) not null,
    file_name varchar(100) not null,
    created_at timestamp not null default NOW (),
    foreign key (message_id) references messages (id) on delete cascade
  );

create table
  message_reactions (
    id UUID primary key default uuidv7 (),
    message_id UUID not null,
    user_id UUID,
    emoji varchar(10) not null,
    foreign key (message_id) references messages (id) on delete cascade,
    foreign key (user_id) references users (id) on delete set null
  );