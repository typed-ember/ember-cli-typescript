// BEGIN-SNIPPET user-profile.ts
import Component from '@glimmer/component';

function isURL(input?: string): boolean {
  // imagine a smarter implementation here!
  return !!input;
}

interface User {
  name: string;
  avatar?: string;
  bio?: string;
}

export default class UserProfile extends Component<User> {
  get userInfo(): string {
    return this.args.bio ? `${this.args.name} ${this.args.bio}` : this.args.name;
  }

  get avatar(): string | undefined {
    return isURL(this.args.avatar) ? this.args.avatar : undefined;
  }
}
// END-SNIPPET
