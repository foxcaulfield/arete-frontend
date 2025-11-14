module.exports = {
  branches: [
    'main',
    { name: 'develop', channel: 'beta', prerelease: 'beta' },
    { name: 'release/*', prerelease: true }
  ],
  tagFormat: 'v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
    ['@semantic-release/npm', { npmPublish: false }]
    // NO @semantic-release/github (no releases)
    // NO @semantic-release/changelog (no changelog)
    // NO @semantic-release/git (no commits back)
  ]
};