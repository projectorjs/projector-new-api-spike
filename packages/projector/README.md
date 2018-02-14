## Target:

Build target e.g. `build:babel`.

## Rule:

Description of a target.

### Rule:

Inputs (src): Set of globs files can be matched against. [required]
Outputs (dest): Function that converts input_path -> output_path
Tasks (tasks): List of tasks e.g. IR -> task -> IR -> task -> IR -> ... [required]
Cache (cache): Cache can be boolean e.g. true/false. Also can specify dependencies e.g. checksum for .babelrc etc...

### Group Rule:

Accepts list of build targets... e.g.: [ [flow, eslint], [build:pkg, build:babel] ]

## Task:

Action performed on a file.

```
IR -> transform -> IR
```

## Intermediate representation [IR]:

```
input.js -> {
  cache: true
  input: 'input.js',
  output: 'dist/input.js',
  content: 'file content',
  attachments: IR[],
}
```

## Algorithm:

```
$ projector target
```

### Rule:

1. Create inputs:
   a. Using `Rule#src` get globs.
   b. // TODO: cache
   c. Using globs get all matching files.
   d. Return inputs.
2. Populate inputes from cache.
3. If inputs haven't changed get outputs from cache
4. If inputs have changed:
   a. Create new outputs by applying `Rule#dest` function on every input.
   b. Cache outputs
   c. Return outputs
5. Run task for inputs that have changed.
6. Output results of applying tasks
7. Output attachements of results
8. Cache results

### Group Rule:

1. Run targets in a sequence
2. If a target is an array of targets run them in parallel
