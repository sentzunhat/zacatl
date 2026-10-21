import { Service } from '@sentzunhat/zacatl/service';

describe('Zacatl raw-source resolution', () => {
  it('loads Service and its transitive source imports', () => {
    expect(Service).toBeDefined();
  });
});
