/**
 * Objet des details d'un utilisateur.
 *
 * @author Roger Montero
 */
class UserDetail {
  #bio;

  #workplace;

  #socials;

  #location;

  constructor({
    bio, workplace, socials, city, country,
  }) {
    this.#bio = bio;
    this.#workplace = workplace;
    this.#socials = socials;
    this.#location = { city, country };
  }

  getBio() {
    return this.#bio;
  }

  getWorkplace() {
    return this.#workplace;
  }

  getSocials() {
    return this.#socials;
  }

  getLocation() {
    return this.#location;
  }
}

module.exports = UserDetail;
