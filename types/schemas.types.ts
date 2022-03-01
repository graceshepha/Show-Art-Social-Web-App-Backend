import { Types } from "mongoose";

type SocialsDetailsUser = {
  twitter?: string;
  facebook?: string;
  website?: string;
};

type LocationDetailsUser = {
  city?: string;
  country?: string;
};

type DetailsUser = {
  bio?: string;
  workplace?: string;
  socials?: SocialsDetailsUser;
  location?: LocationDetailsUser;
};

export type User = {
  username: string;
  email: string;
  emailVerified: boolean;
  picture: string;
  details?: DetailsUser;
  posts: Types.ObjectId[];
  likedPosts: Types.ObjectId[];
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
};

type CommentPost = {
  user: Types.ObjectId;
  comment: string;
  date: Date;
};

type MetaDataPost = {
  likes: Types.ObjectId[];
  views: number;
};

export type Post = {
  title: string;
  owner: Types.ObjectId;
  image: string;
  description?: string;
  visibility: "public" | "private";
  date: Date;
  tags: Types.ObjectId[];
  meta: MetaDataPost;
  comments: CommentPost[];
};

export type Tag = {
  name: string;
  description?: string;
  posts: Types.ObjectId[];
};
