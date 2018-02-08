(function() {
  var commentTemplate = document.querySelector('#comment-template').content;
  console.log(commentTemplate);
	var discussionsContainer = document.querySelector('.discussions-vk');

  var MONTHS = [
		 'янв',
		 'фев',
		 'марта',
		 'апр',
		 'мая',
		 'июня',
		 'июля',
		 'августа',
		 'сентября',
		 'окт',
		 'ноября',
		 'дек'
	];

  var xhr = new XMLHttpRequest();
  var fragment = document.createDocumentFragment();

  function createCommentElement() {

  }

  function addComments(data) {
    var items = data.itmes;

    for (var i = 0; i < items.length; i++) {
      fragment.appendChild(elements[i]);
    }

    discussionsContainer.appendChild(fragment);
  }

  function showDiscussion(data) {
    addComments(data);
    console.log(data);
  }

  xhr.open('GET', 'https://hookah-fast.ru/test/build/reviews.php', true);

  xhr.onload = function() {
    var data = JSON.parse(this.response).response;
    showDiscussion(data);
  }

  xhr.onerror = function() {
    console.log('Ошибка ' + this.status);
  }

  xhr.send();
})();
