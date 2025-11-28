describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    // Expecting 'Tab One' which is present in the default template (and our native override)
    await expect(element(by.text('Tab One (Native)'))).toBeVisible();
  });
});
