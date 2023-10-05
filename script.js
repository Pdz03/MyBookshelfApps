const reads = [];
const RENDER_EVENT = 'render-read';

const SAVED_EVENT = 'saved-read';
const STORAGE_KEY = 'MYBOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addRead();
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchBook = document
      .getElementById('searchBookTitle')
      .value.toLowerCase();
    const bookList = document.querySelectorAll('.book_item > h2');
    for (const book of bookList) {
      if (book.innerText.toLowerCase().includes(searchBook)) {
        book.parentElement.style.display = 'block';
      } else {
        book.parentElement.style.display = 'none';
      }
    }
    console.log(bookList);
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

});

const BookStorage = {
  __reads: [],
  _STORAGE_KEY: 'MYBOOKSHELF_APPS',

  /**
   * Get all book data from storage with optional filter
   * @param {*} filter
   * @returns
   */
  getAll:  function({ name } = {}) {
      if (isStorageExists()) {
          const storageData = localStorage.getItem(this._STORAGE_KEY)
          this._reads = JSON.parse(storageData) || []
      }

      if (name) {
          return this._reads.filter(book => book.title.toLowerCase().includes(name.toLowerCase()))
      }
      
      return this._reads
  },

  /**
   * Add book to local storage or update if exists
   * @param {*} book
   * @param {string} book.id
   * @param {string} book.title
   * @param {string} book.author
   * @param {number} book.year
   * @param {boolean} book.isComplete
   */
  set: function(book) {
      const books = this.getAll()
      const isBookExists = reads.find(b => b.id === book.id)

      if (isBookExists) {
          const index = reads.findIndex(b => b.id === book.id)
          reads[index] = book
      } else {
          this._reads.push(book)
      }

      if (isStorageExists()) {
          localStorage.setItem(this._STORAGE_KEY, JSON.stringify(this._reads))
      }
  },
}



function addRead() {
  let text = "Apakah kamu yakin ingin menambahkan buku tersebut?";
  if(confirm(text)==true){
  const textTitle = document.getElementById('inputBookTitle').value;
  const textAuthor = document.getElementById('inputBookAuthor').value;
  const textYear = document.getElementById('inputBookYear').value;
  var cbCompleted = document.getElementsByName('inputBookIsComplete');
  var isCompleted = false;
    for (var i = 0; i < cbCompleted.length; i++) {
      if (cbCompleted[i].checked) {
        isCompleted = true;
      }
    }
  
 
  const generatedID = generateId();
  const readObject = generateReadObject(generatedID, textTitle,textAuthor,textYear,isCompleted);
  reads.push(readObject);
 
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  }
}

function generateId() {
  return +new Date();
}
 
function generateReadObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}





document.addEventListener(RENDER_EVENT, function () {

    const uncompletedREADList = document.getElementById('reads');
    uncompletedREADList.innerHTML = '';

    const completedREADList = document.getElementById('completedread');
    completedREADList.innerHTML = '';
   
    for (const readItem of reads) {
      const readElement = makeRead(readItem);
      if(!readItem.isCompleted){
      uncompletedREADList.append(readElement);
      }else{
      completedREADList.append(readElement);
      }
    }
  });

function makeRead(readObject) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = readObject.title;
 
  const textAuthor = document.createElement('p');
  textAuthor.innerText = 'Penulis : '+readObject.author;

  const textYear = document.createElement('p');
  textYear.innerText = 'Tahun : '+readObject.year;
 
  const container = document.createElement('article');
  container.classList.add('book_item', 'shadow');
  container.append(textTitle, textAuthor, textYear);
  container.setAttribute('id', `read-${readObject.id}`);

  if (readObject.isCompleted){
    const undo = document.createElement('i');
    undo.setAttribute("class","fa fa-arrow-up");

    const undoButton = document.createElement('button');
    undoButton.setAttribute("title","Ubah Status Buku Menjadi Belum dibaca");
    undoButton.append(undo);

    const trash = document.createElement('i');
    trash.setAttribute("class","fa fa-trash");

    const removeButton = document.createElement('button');
    removeButton.setAttribute("title","Hapus Buku dari Daftar");
    removeButton.append(trash);

    const pencil = document.createElement('i');
    pencil.setAttribute("class","fa fa-pencil");

    const editButton = document.createElement('button');
    editButton.setAttribute("title","Edit Data Buku");
    editButton.append(pencil);

    const action = document.createElement('div');
    action.classList.add('action');
    action.append(undoButton, removeButton,editButton);

    undoButton.addEventListener('click', function () {
      undoReadFromCompleted(readObject.id);
    });

    removeButton.addEventListener('click', function () {
        removeRead(readObject.id);
    });

    editButton.addEventListener('click', function () {
      editRead(readObject.id);
    });



    container.append(action);
  }else{
    const check = document.createElement('i');
    check.setAttribute("class","fa fa-check");

    const addButton = document.createElement('button');
    addButton.setAttribute("title","Ubah Status Buku Menjadi Sudah dibaca");
    addButton.append(check);

    const trash = document.createElement('i');
    trash.setAttribute("class","fa fa-trash");

    const removeButton = document.createElement('button');
    removeButton.setAttribute("title","Hapus Buku dari Daftar");
    removeButton.append(trash);

    const pencil = document.createElement('i');
    pencil.setAttribute("class","fa fa-pencil");

    const editButton = document.createElement('button');
    editButton.setAttribute("title","Edit Data Buku");
    editButton.append(pencil);

    const action = document.createElement('div');
    action.classList.add('action');
    action.append(addButton, removeButton, editButton);

    addButton.addEventListener('click', function () {
      addReadToCompleted(readObject.id);
    });

    removeButton.addEventListener('click', function () {
      removeRead(readObject.id);
    });

    editButton.addEventListener('click', function () {
      editRead(readObject.id);
    });
    container.append(action);
  }
 
  return container;
}

function addReadToCompleted (readId) {
  let text = "Apakah kamu yakin ingin merubah status buku tersebut?";
  if(confirm(text)==true){
  const readTarget = findRead(readId);
 
  if (readTarget == null) return;
 
  readTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  }
}

function undoReadFromCompleted(readId) {
  let text = "Apakah kamu yakin ingin merubah status buku tersebut?";
  if(confirm(text)==true){
  const readTarget = findRead(readId);
 
  if (readTarget == null) return;
 
  readTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  }
}

function removeRead(readId) {
  let text = "Apakah kamu yakin ingin menghapus buku dari daftar?";
  if(confirm(text)==true){
          const readTarget = findReadIndex(readId);
 
          if (readTarget === -1) return;
         
          reads.splice(readTarget, 1);
          document.dispatchEvent(new Event(RENDER_EVENT));
          saveData();
  }
}

function getBookInputForm() {
  return {
      container: document.querySelector('#inputBook'),
      inputBookId: document.querySelector('#inputBookId'),
      inputTitle: document.querySelector('#inputBookTitle'),
      inputAuthor: document.querySelector('#inputBookAuthor'),
      inputYear: document.querySelector('#inputBookYear'),
      checkBoxIsComplete: document.querySelector('#inputBookIsComplete'),
      buttonSubmit: document.querySelector('#bookSubmit')
  }
}

const bookInputForm = getBookInputForm();

bookInputForm.checkBoxIsComplete.addEventListener('change', (e) => {
  const submitSpanText = bookInputForm.buttonSubmit.querySelector('span')
  if (e.target.checked) {
      submitSpanText.innerText = 'Sudah selesai dibaca'
  } else {
      submitSpanText.innerHTML = 'Belum selesai dibaca'
  }
})

function editRead(readId){
  const edit = document.querySelector(".edit_section");
  edit.removeAttribute("hidden");
  const readTarget = findRead(readId);
  const editBookTitle = document.getElementById("editBookTitle");
  editBookTitle.value = readTarget.title;
  const editBookAuthor = document.getElementById("editBookAuthor");
  editBookAuthor.value = readTarget.author;
  const editYear = document.getElementById("editBookYear");
  editYear.value = readTarget.year;
  const editBookCompleted = document.getElementById("editCompleted");
  editBookCompleted.checked = readTarget.isCompleted;
  const submitEdit = document.getElementById("edit-submit");
  submitEdit.addEventListener("click", function (event) {
    updateEditBook(
      editBookTitle.value,
      editBookAuthor.value,
      editYear.value,
      editBookCompleted.checked,
      readId
    );
    const edit = document.querySelector(".edit_section");
    edit.setAttribute("hidden", "");
    event.preventDefault();
  });
}

function updateEditBook(title, author, year, completed, id) {
  const StorageBook = JSON.parse(localStorage[STORAGE_KEY]);
  const bookIndex = findReadIndex(id);
  console.log(StorageBook);
  console.log(bookIndex);
  StorageBook[bookIndex] = {
    id: id,
    title: title,
    author: author,
    year: year,
    isCompleted: completed,
  };
  const parsed = JSON.stringify(StorageBook);
  localStorage.setItem(STORAGE_KEY, parsed);
  location.reload(true);
  
}

function findRead(readId) {
  for (const readItem of reads) {
    if (readItem.id === readId) {
      return readItem;
    }
  }
  return null;
}

function findReadIndex(readId) {
  for (const index in reads) {
    if (reads[index].id === readId) {
      return index;
    }
  }
 
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(reads);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}


 
function isStorageExist(){
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const read of data) {
      reads.push(read);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

let mybutton = document.getElementById("btnTop");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

function topFunction() {
window.scrollTo({
    top: 0,
    behavior: 'smooth'
})
}