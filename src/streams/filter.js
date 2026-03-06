import { FilterByArgumentTranform } from './customized/filterTranformStream.js';

const filter = () => {
  const filterTransform = new FilterByArgumentTranform();
  process.stdin
    .pipe(filterTransform)
    .pipe(process.stdout);
};

filter();