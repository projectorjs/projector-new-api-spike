## Target:

Build target e.g. build:babel

## Rule:

Description of a target

### Rule:

Inputs (src): Set of globs files can be matched against. [required]
Outputs (dest): Function that converts input_path -> output_path
Tasks (tasks): List of tasks e.g. IR -> task -> IR -> task -> IR -> ... [required]
Cache (cache): Cache can be boolean e.g. true/false. Also can specify dependencies e.g. checksum for .babelrc etc...

### Group Rule:

Accepts list of build targets... e.g.: [ [flow, eslint], [build:pkg, build:babel] ]

## Task:

Action performed on a file.

```js
{
  transform: (IR) => IR,
  prepare: (input) => [Rule#dest(suboutput), ...] // TODO: rename that
}

// OR

(IR) => transform(IR)
```

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

## Outputs:

Outputs is just a hash { input -> output }.

## Algorithm:

```
$ projector target
```

### Rule:

1. Create inputs:
   a. If git hash of inputs cache === current git hash – return inputs from cache...
   b. Else get changed files since git hash of inputs cache
   b1. Compare changed files against inputs and update inputs cache
   b2. Return inputs
2. Populate inputes from cache.
3. If inputs haven't changed get outputs from cache
4. If inputs have changed:
   a. Create new outputs by applying `Rule#dest` function on every input.
   a. Create additional outputs by applying `task#prepare` on every input.
   a1. Cache outputs
   a2. Return outputs
5. Run task for inputs that have changed.
6. Output results of applying tasks
7. Output attachements of results
8. Cache results

### Group Rule:

1. Run targets in a sequence
2. If a target is an array of targets run them in parallel

// TODO: can multiple inputs produce 1 output? (e.g. file concatenation)
// TODO: should source maps be supported out-of-the-box?
