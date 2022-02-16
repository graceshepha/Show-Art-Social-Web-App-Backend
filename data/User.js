// @ts-check
import UserDetail from './UserDetails';

/**
 * Objet d'un utilisateur (son utilisation est à confirmer).
 *
 * @author Roger Montero
 */
class User {
  #username;

  #email;

  #emailVerified;

  #picture;

  #details;

  #posts;

  #likedPosts;

  #followers;

  #following;

  constructor({
    username, email, emailVerified, picture, details, posts, likedPosts, followers, following,
  }) {
    this.#username = username;
    this.#email = email;
    this.#emailVerified = emailVerified;
    this.#picture = picture;
    if (details instanceof UserDetail) {
      this.#details = details;
    } else if (details instanceof Object) {
      this.#details = new UserDetail(details);
    }
    this.#posts = posts;
    this.#likedPosts = likedPosts;
    this.#followers = followers;
    this.#following = following;
  }

  getUsername() {
    return this.#username;
  }

  getEmail() {
    return this.#email;
  }

  isEmailVerified() {
    return this.#emailVerified;
  }

  getPicture() {
    return this.#picture;
  }

  getDetails() {
    return this.#details;
  }

  getPosts() {
    return this.#posts;
  }

  getLikedPost() {
    return this.#likedPosts;
  }

  getFollowers() {
    return this.#followers;
  }

  getFollowing() {
    return this.#following;
  }

  className() {
    return this.constructor.name;
  }
}

export default User;
