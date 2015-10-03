
/* SS process related handling begin
 */
process.on('exit', function () {
  /* cleanup
   */
  if (errors === 0) {
    console.log ('\n\033[1mDONE, no errors.\033[0m\n');
    process.exit(0);
  } else {
    console.log('\n\033[1mFAIL, '+ errors +' error'+ (errors > 1 ? 's' : '') +' occurred!\033[0m\n');
    process.exit(1);
  }
});

/* prevent errors from killing the process
 */
process.on('uncaughtException', function (err) {
  console.log();
  console.error(err.stack);
  console.trace();
  console.log();
  errors++;
});


/* process related handling end
 */
