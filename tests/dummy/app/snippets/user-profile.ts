// BEGIN-SNIPPET user-profile.ts
import Component from '@glimmer/component';
import { generateUrl } from '../lib/generate-avatar';

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

  get avatar(): string {
    return this.args.avatar ?? generateUrl();
  }
}
// END-SNIPPET
