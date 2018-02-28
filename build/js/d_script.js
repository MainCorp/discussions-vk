(function() {
  // user setting, такие же настройки в d_reviews.php
  var group_id = ''; // вписать id вашей группы
  var topic_id = ''; // вписать id поста
  var JSONReviewsGeneratorReference = ''; // вписать путь к файлу d_reviews.php (например https://my-site.ru/d_reviews.php)
  var quantityComments = 3; // количество комментариев для вывода

  // script
	var discussionsContainer = document.querySelector('.discussions-vk');
  var commentTemplate;

  // for IE
  if ('content' in document.querySelector('#comment-template')) {
    commentTemplate = document.querySelector('#comment-template').content;
  } else {
    commentTemplate = document.querySelector('.comment');
  }

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

  var VK_LINK = 'https://vk.com/';

  var xhr = new XMLHttpRequest();
  var fragment = document.createDocumentFragment();

  function isOnline(checkStatus) {
    var status;

    if (checkStatus === 0) {
      status = 'Не в сети';
    } else {
      status = 'В сети';
    }

    return status;
  }

  function validationDate(date) {
    var minutes = String(date.getMinutes());
    var hours = String(date.getHours());

    if (minutes.length < 2) {
      minutes += '0';
    }

    if (hours.length < 2) {
      hours += '0';
    }

    date = date.getDate() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear() + ' в ' + hours + ':' + minutes;

    return date;
  }

  function getCommentText(data, i) {
    var text = data.items[i].text;
    var dataReplyToUser = text.split(',')[0];
    var dataReplyToUser_user = dataReplyToUser.split('[')[1];
    var idPost;
    var userName;
    var postWithoutReply;

    if (dataReplyToUser_user !== undefined) {
      postWithoutReply = text.split('],')[1].trim();
      idPost = dataReplyToUser.split('[')[1].split(']')[0].split('_')[1].split('|')[0];
      userName = dataReplyToUser.split('[')[1].split(']')[0].split('_')[1].split('|')[1];

      text = userName + ', ' + postWithoutReply;
    }

    return text;
  }

  function createCommentElement(data, i) {
    var element = commentTemplate.cloneNode(true);
    var sourceIDLink = VK_LINK + data.groups[0].screen_name;
    var sourcePhoto = data.groups[0].photo_100;
    var stateOnline = '';
    var nameTitle = data.groups[0].name;
    var sourceSticker = '';

    var date = new Date(data.items[i].date * 1000);

    var commentDate = validationDate(date);

    element.querySelector('.comment__text-title').textContent = getCommentText(data, i);
    element.querySelector('.comment__like-number').textContent = data.items[i].likes.count;
    element.querySelector('.comment__comment-date').href = VK_LINK + 'topic-' + group_id + '_' + topic_id + '?post=' + data.items[i].id;

    for (var j = 0; j < data.profiles.length; j++) {
      if (data.items[i].from_id === data.profiles[j].id) {
        sourceIDLink = VK_LINK + data.profiles[j].screen_name;
        sourcePhoto = data.profiles[j].photo_100;
        stateOnline = isOnline(data.profiles[j].online);
        nameTitle = data.profiles[j].first_name + ' ' + data.profiles[j].last_name;
      }
    }

    for (var key in data.items[i]) {
      if (data.items[i].hasOwnProperty('attachments')) {
        switch (data.items[i].attachments[0].type) {
          case 'sticker':
            sourceSticker = data.items[i].attachments[0].sticker.photo_128;
            break;
          case 'photo':
            sourceSticker = data.items[i].attachments[0].photo.photo_604;
            break;
        }
      }
    }

    element.querySelector('.comment__logo-image').src = sourcePhoto;
    element.querySelector('.comment__logo').href = sourceIDLink;
    element.querySelector('.comment__online').textContent = stateOnline;
    element.querySelector('.comment__group-title').textContent = nameTitle;
    element.querySelector('.comment__group-title').href = sourceIDLink;
    element.querySelector('.comment__comment-date').textContent = commentDate;
    element.querySelector('.comment__image').src = sourceSticker;

    return element;
  }

  function addComments(data) {
    if (data.count > quantityComments - 1) {
      for (var i = 0; i < quantityComments; i++) {
        fragment.appendChild(createCommentElement(data, i));
      }
    } else {
      for (var i = 0; i < data.count; i++) {
        fragment.appendChild(createCommentElement(data, i));
      }
    }

    discussionsContainer.appendChild(fragment);
  }

  function showDiscussion(data) {
    addComments(data);
  }

  xhr.open('GET', JSONReviewsGeneratorReference, true);

  xhr.onload = function() {
    var data = JSON.parse(this.response).response;
    showDiscussion(data);
  }

  xhr.onerror = function() {
    console.log('Ошибка ' + this.status);
  }

  xhr.send();
})();
