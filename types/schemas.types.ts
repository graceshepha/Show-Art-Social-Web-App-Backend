import { Types } from "mongoose";

export type User = {
  username: string;
  email: string;
  emailVerified: boolean;
  picture: string;
  details?: {
    bio?: string;
    workplace?: string;
    socials?: {
      twitter?: string;
      facebook?: string;
      website?: string;
    };
    location?: {
      city?: string;
      country?: string;
    };
  };
  posts: Types.ObjectId[];
  likedPosts: Types.ObjectId[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
};

export type Post = {
  title: string;
  owner: Types.ObjectId;
  image: string;
  description?: string;
  visibility: "public" | "private";
  date: Date;
  tags: Types.ObjectId[];
  meta: {
    likes: Types.ObjectId[];
    views: number;
  };
  comments: {
    user: Types.ObjectId;
    comment: string;
  }[];
};

export type Tag = {
  name: string;
  description?: string;
  posts: Types.ObjectId[];
};
