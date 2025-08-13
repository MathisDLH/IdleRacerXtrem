import { getMetadataArgsStorage } from 'typeorm';
import { Upgrade } from './upgrade.entity';

describe('Upgrade Entity', () => {
  it('should define userUpgrade relation', () => {
    const relation = getMetadataArgsStorage().relations.find(
      (r) => r.target === Upgrade && r.propertyName === 'userUpgrade',
    );

    expect(relation).toBeDefined();
    expect(relation!.relationType).toBe('one-to-many');
  });
});
