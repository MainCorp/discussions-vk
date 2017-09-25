(function() {
	/**
	 * Отображает список сообщений из обсуждения в vk.com
	 * @variable {Object} template шаблон для обсуждений
	 * @variable {Object} container контейнер, где будут обсуждения
	 *
	 * @variable {Number} group_id (id группы в вк)
	 * @variable {Number} topic_id (id обсуждения)
	 * @variable {Number} count колличество загруженных комментариев на странице
	 * @variable {Number} extended будут ли загружены профили в отзывы (0 - нет, 1 - да)
	 *
	 * @variable {String} linkToGroup ссылка на группу или администратора
	 * @variable {String} adminName имя администратора
	 * @variable {String} adminIcon иконка администратора
	 * @variable {Number} startComment точка отсчёта для комментария
	 */

	var template = document.querySelector('#comment-template');
	var container = $('.discussions-vk');

	var group_id = ''; // id группы
	var topic_id = ''; // id обсуждения
	var count = 100;
	var extended = 1; // будут ли загружены профили в отзывы (0 - нет, 1 - да)
	var need_likes = 1; // загружаем лайки (0 - не загружать, 1 - загрузить)
	var sort = 0; // фильтруем вывод комментариев (0 - с начала, 1 - с конца)
	var startComment = 1; // С какого комментария выводим
	var application = 1; // Добавляем стикеры/фото в список отзывов (0 - не добавлять, 1 - добавлять)

	var linkToGroup = 'https://vk.com/'; // ссылка на вас или вашу группу
	var adminName = 'Администратор'; // Ваше имя иои название вашей группы
	var adminIcon = 'https://vk.com/images/camera_100.png'; // URL иконки вашего vk или группы, размер 100x100

	var apiLink;

	var months = [
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

	var fragment = document.createDocumentFragment();

	if (sort === 0 || sort === '0') {
		sort = 'asc';
	} else {
		sort = 'desc';
	}

	function showDiscussion(req, templateElement, commentsContainer, idStartComment) {
		var elementToClone;

		if ('content' in templateElement) {
			elementToClone = templateElement.content.querySelector('.comment');
		} else {
		  	elementToClone = templateElement.querySelector('.comment');
		}

		/**
		 * Парсит полученный объект и проводит валидацию
		 * @param {Object} comment клон комментария
		 * @param {Object} data объект с комментариями
		 * @param {Object} getText
		 * @param {String} getLink
		 */

		function validationComment(comment, data, getText, getLink) {
			var collectionTextItem = [];

			if (getText.length > 0) {
				if (data.text.split(':bp-62330024_')[1] !== undefined) {
					var linktoToAnswerUser = data.text.split(':bp-62330024')[0].split('[')[1];
					var toAnswerUser = data.text.split(':bp-62330024_')[1].split('|')[1].split(']')[0];
					var text = getText.split('],');
					var userMessage = [];

					var userLink = '<a class="comment__text-link" href="https://vk.com/' + linktoToAnswerUser + '">' + toAnswerUser + '</a>';

					for (var i = 1; i < text.length; i++) {
						userMessage.push(text[i]);
					}

					getText = userLink + ',' + userMessage;
				} else {
					getText = data.text.split('<br>');
				}
			} else {
				getText = '';
			}

			// [club62330024:bp-62330024_636|Северный Флот]

			for (key in data) {
				if (typeof data[key] === 'object') {
					getLink = '';

					if (application === '1' || application === 1) {
						if (data.attachments !== undefined) {
							switch(data.attachments[0].type) {
								case 'photo':
									comment.querySelector('.comment__image').src = data.attachments[0].photo.src_big;
									break;
								case 'video':
									comment.querySelector('.comment__image').src = data.attachments[0].video.image_big;
									break;
								case 'sticker':
									comment.querySelector('.comment__image').src = data.attachments[0].sticker.photo_128;
										break;
							}
						}
					}
				}
			}

			collectionTextItem = [getText, getLink];

			return collectionTextItem;
		}

		/**
		 * Добавляет содержимое (автор, иконка, онлайн, ссылки) к комментарию
		 * @param {Number} i текущий элемент
		 * @param {Object} comments коллекция комментариев
		 * @param {Object} profiles коллекция пользователей
		 * @param {Object} comment ссылка на текущий комментарий
		 */

		function addAuthor(i, comments, profiles, comment, data) {
			for (var j = 0; j < profiles.length; j++) {
				if (i-1 === comments.length - 1) {
					return false;
				} else {
					if (comments[i].from_id === profiles[j].uid) {
							var date = new Date(data.date * 1000);
							var commentDate = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' в ' + date.getHours() + ':' + date.getMinutes();

	    				comment.querySelector('.comment__logo-image').src = profiles[j].photo_medium_rec;
	    				comment.querySelector('.comment__group-title').textContent = profiles[j].first_name + ' ' + profiles[j].last_name;
							comment.querySelector('.comment__comment-date').textContent = commentDate;

							if (data.likes !== undefined) {
								comment.querySelector('.comment__like-number').textContent = data.likes.count;
							}

	    				if (profiles[j].online === 1) {
	    					comment.querySelector('.comment__online').textContent = 'online';
	    					comment.querySelector('.comment__online').style = 'font-weight: bold';
	    				} else {
	    					comment.querySelector('.comment__online').textContent = 'offline';
	    					comment.querySelector('.comment__online').style = 'font-weight: 300';
	    				}

	    				if (comments[i].from_id === 101) {
	    					comment.querySelector('.comment__group-title').textContent = adminName;
	    					comment.querySelector('.comment__group-title').href = linkToGroup;
	    					comment.querySelector('.comment__logo').href = linkToGroup;
	    					comment.querySelector('.comment__logo-image').src = adminIcon;
	    				} else {
	    					comment.querySelector('.comment__group-title').href = 'http://vk.com/' + profiles[j].screen_name;
	    					comment.querySelector('.comment__logo').href = 'http://vk.com/' + profiles[j].screen_name;
	    				}
	    			}
					}
    		}
		}

		/**
		 * Возвращает комментарий
		 * @param {Object} data объект с комментарием
		 * @param {Object} comments коллекция комментариев
		 * @param {Object} profiles коллекция пользователей
		 * @param {Object} i идентификатор текущего комментария
		 */

		function showCommentElement(data, comments, profiles, i) {
			var comment = elementToClone.cloneNode(true);
			var getText = data.text;
			var getLink;

			comment.querySelector('.comment__text-title').innerHTML = validationComment(comment, data, getText, getLink)[0];

			addAuthor(i, comments, profiles, comment, data);

			return comment;
		}

		$.ajax({
				url : req,
		    type : "GET",
		    dataType : "jsonp",
		    success : function(msg) {
						var comments = $(msg.response.comments);
		    		var profiles = $(msg.response.profiles);

			    	for (var i = idStartComment; i < comments.length; i++) {
								fragment.append(showCommentElement(comments[i], comments, profiles, i));
						}

						commentsContainer.append(fragment);
				}
		});
	}

	apiLink = 'https://api.vk.com/method/board.getComments?group_id=' + group_id + '&topic_id=' + topic_id + '&count=' + count + '&extended=' + extended + '&need_likes=' + need_likes + '&sort=' + sort;

	console.log(apiLink);
	showDiscussion(apiLink, template, container, startComment);
})();
