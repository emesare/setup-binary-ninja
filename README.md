# Setup Binary Ninja action

This action installs [Binary Ninja] for testing and building both native and python plugins within Github CI. NOTE: This only supports Linux, if you want to run on windows or mac runners you will need to manually create a headless version of [Binary NInja] and pass in the `download-url`.

## Example usage

When using this action it should be noted that the license input should basically always be a secret.

```yaml
uses: emesare/setup-binary-ninja@v1-beta
with:
  license: '${{ secrets.BN_SERIAL }}'
```

## Example workflows

- [binja-msvc](https://github.com/emesare/binja-msvc/actions/runs/5149259751/jobs/9272034289)

## Inputs

### `license`

Your serial number, this is **required** unless you specify a `download-url`. Use a secret to store the serial number securely.

### `extract-path`

Where to extract the installation. Default is `"${RUNNER_TEMP}"`.

### `download-url`

Override the default download process. This is for advanced use cases where you cannot otherwise depend on the regular download servers, or if you need a specific version of [Binary Ninja]. If this is set you do not need to set the `license` input.

### `dev-branch`

Whether or not to use the developer branch of [Binary Ninja]. Default is `false`.

### `python-support`

Whether or not to expose [Binary Ninja] to the runners python installation, i.e. the ability to `import binaryninja` in python. Make sure you have setup python **before** this action is run. Default is `true`.

## Outputs

### `install-path`

The installation directory.

## Developing

### Building

Github actions must not import remote packages, thus a bundler is required to pack all dependencies into a single script. To regenerate the bundle (dist/index.js) run `npm run build`.

### Testing

Use [act] to test your changes locally, make sure to specify a runner image that has python installed if `python-support` is set to true.

```bash
act push -s BN_SERIAL=yourserial -P ubuntu-latest=catthehacker/ubuntu:act-latest
```

### Commiting

Oddly enough github actions requires the distributed bundle to be in-tree, when commiting changes insure that the bundle you have built is up-to-date with any changes made to the source.

[Binary Ninja]: https://binary.ninja
[act]: https://github.com/nektos/act
