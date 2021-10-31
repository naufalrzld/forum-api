exports.up = (pgm) => {
  pgm.alterColumn('threads', 'created_at', {
    default: pgm.func('current_timestamp'),
  });

  pgm.alterColumn('comments', 'created_at', {
    default: pgm.func('current_timestamp'),
  });

  pgm.alterColumn('replies', 'created_at', {
    default: pgm.func('current_timestamp'),
  });
};

exports.down = (pgm) => {
  pgm.alterColumn('threads', 'created_at', {
    default: null,
  });

  pgm.alterColumn('comments', 'created_at', {
    default: null,
  });

  pgm.alterColumn('replies', 'created_at', {
    default: null,
  });
};
