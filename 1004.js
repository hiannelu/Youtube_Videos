let channelId = 'UCMUnInmOkrWN4gof9KlhNmQ';
let APIKey = 'AIzaSyCzAL1xY0dm3aKQIkiYdbpT-QXytuXR3qI';
let lastPg = false;
let regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
let convert = (time) => {
	let arr = time.match(regex);
	if(arr[1] !== undefined) return arr[1]+':'+arr[2]+':'+arr[3];
	else return arr[2]+':'+arr[3];
}

let arrPg = ['CAwQAQ','CAwQAA', 'CBgQAA', 'CCQQAA', 'CDAQAA', 'CDwQAA', 'CEgQAA', 'CFQQAA', 'CGAQAA'];
let currentPg = 0;
let player, videoId;
let savedArr = [];


function onPlayerStateChange(event) {
	if (event.data === 1) $('#myAd').hide();
	else if (event.data === 2) $('#myAd').show();
}
function saveVids(videoId) {
	let savedVids = videoId.replace(/(icon-)|(button-)/, '');
	let savedLen = savedArr.length;
	let savedIcon = `#icon-${savedVids}`;
	let savedButton = `#button-${savedVids}`;

	while(savedLen >= 0) {
		if(savedArr[savedLen] === savedVids) {
			savedArr.splice(savedLen, 1);
			$(savedButton).val('SAVE');
			$(savedIcon).css("color", "black");
			break;
			
		} else if (savedLen === 0) {
			savedArr.push(savedVids);
			$(savedButton).val('CANCEL');
			$(savedIcon).css("color", "#FF5151");
		}
		savedLen--;
	}
	sessionStorage.setItem('savedVids',  JSON.stringify(savedArr));
	let newSavedLen = savedArr.length;
	$('#saved-videos').empty();
	while(newSavedLen > 0) {
		createSavedVids(savedArr[newSavedLen - 1]);
		newSavedLen--;
	}
					
}
function createSavedVids(videoId) {
	$.ajax({
		async: false,
		type: 'GET',
		data: {
			part: 'contentDetails, snippet',
			id: videoId,
			key: APIKey
		},
		url: 'https://www.googleapis.com/youtube/v3/videos',
		success: function(data) {
			let output;
					
			$.each(data.items, function(i, item) {
				videoTitle = item.snippet.title;
				description = item.snippet.description;
				thumbnails = item.snippet.thumbnails.medium.url;
				videoLength = convert(item.contentDetails.duration);
				output = 
				`<td>
				<input type="image" id="saved-${videoId}" src="${thumbnails}">
				<div class="video-title video-title-outer">${videoTitle}</div>
				<div>
				  <i id="icon-${videoId}" class="fas fa-heart save-icon" onclick="saveVids(id)"></i>
				  <div class="video-length">${videoLength}</div>
				</div>
				</td>`
				$('#saved-videos').prepend(output);
				
				var vid = `#saved-${videoId}`;
				let popupVids = 
				  `<video id="play-video" />
				  <div class="video-title">${videoTitle}</div>
				  <textarea id="display-text" rows="4" cols="85">${description}</textarea>
				  <input type="button" id="button-${videoId}" class="save-videos-button" value="SAVE" onclick="saveVids(id)">
				  <input type="button" id="show-button" value="SHOW MORE" onclick="showMore()">`
				
				$(vid).on('click', function() {
					$('#popup-overlay').show();
					$('#popup-videos').html(popupVids);
					$('body').css('overflow','hidden');
					checkSavedStatus();
					player = new YT.Player('play-video', {
						videoId: videoId,
						events: {
							'onStateChange': onPlayerStateChange
						}
					});
				})
			})
		}
	})	
}
function checkSavedStatus() {
	let getSavedList = sessionStorage.getItem('savedVids');
	
	if (getSavedList) {
		savedArr = JSON.parse(getSavedList);
		let arrLen = savedArr.length;
		while(arrLen > 0) {
			let savedIcon = `#icon-${savedArr[arrLen - 1]}`;
			let savedButton = `#button-${savedArr[arrLen - 1]}`
			$(savedButton).val('CANCEL');
			$(savedIcon).css("color", "#FF5151");
			let videoId = savedArr[arrLen - 1];
			arrLen--;
		}
	}	
}


	
$(document).ready(function() {
	let getInitialList = sessionStorage.getItem('savedVids');
	
	if(getInitialList) {
		savedArr = JSON.parse(getInitialList);
		let initialLen = savedArr.length;

		while(initialLen > 0) {
			createSavedVids(savedArr[initialLen - 1]);
			initialLen--;
		}
	}
	
	
	$.get(
		"https://www.googleapis.com/youtube/v3/channels", {
			part: 'contentDetails',
			id: channelId,
			key: APIKey},
			function(data) {
				$.each(data.items, function(i, item) {
					pid = item.contentDetails.relatedPlaylists.uploads;
					getVids(pid, currentPg);
				})
			}
	);
	
	function getVids(pid, currentPg) {
		$.get(
		"https://www.googleapis.com/youtube/v3/playlistItems", {
			part: 'snippet',
			maxResults: 12,
			playlistId: pid,
			pageToken: arrPg[currentPg],
			key: APIKey},
			function(data) {
				$.each(data.items, function(i, item) {
					videoId = item.snippet.resourceId.videoId;
					getVidsLen(videoId, i, currentPg);
				})
			}
		);
	}
	function getVidsLen(videoId, index, currentPg) {
		$.ajax({
			async: false,
			type: 'GET',
			data: {
				part: 'contentDetails, snippet',
				id: videoId,
				key: APIKey
			},
			url: 'https://www.googleapis.com/youtube/v3/videos',
			success: function(data) {
				var output;
				
				$.each(data.items, function(i, item) {
					checkSavedStatus();
					videoTitle = item.snippet.title;
					description = item.snippet.description;
					thumbnails = item.snippet.thumbnails.medium.url;
					videoLength = convert(item.contentDetails.duration);

					
					
					output = `<div>
					<input type="image" id="${videoId}" src="${thumbnails}">
					<div class="video-title video-title-outer">${videoTitle}</div>
					<div>
					  <i id="icon-${videoId}" class="fas fa-heart save-icon" onclick="saveVids(id)"></i>
					  <div class="video-length">${videoLength}</div>
					</div>
					</div>`

					$('#youtube-videos').append(output);
					
					$('#test-video').on('click', function(e) {
						location.href = "test.html";
					})
					var vid = `#${videoId}`;
					let popupVids = 
						  `<video id="play-video" />
						  <div class="video-title">${videoTitle}</div>
						  <textarea id="display-text" rows="4" cols="85">${description}</textarea>
						  <input type="button" id="button-${videoId}" class="save-videos-button" value="SAVE" onclick="saveVids(id)">
						  <input type="button" id="show-button" value="SHOW MORE" onclick="showMore()">`
					$(vid).on('click', function() {
						//location.href = "redirect.html?"+videoId;
						
						$('#popup-overlay').show();
						$('#popup-videos').html(popupVids);
						$('body').css('overflow','hidden')
						checkSavedStatus();
						player = new YT.Player('play-video', {
							videoId: videoId,
							events: {
							  'onStateChange': onPlayerStateChange
							}
						});
					})
				})
			}
		})
	}


	$('#cancel-popup').on('click', function() {
		$('#popup-overlay').hide();
		$('body').css('overflow','visible');
		player.pauseVideo();
	})
	
	$('.next').on('click', function(e) {
	  $('#youtube-videos').html('');
	   currentPg += 1;
	   if (arrPg[currentPg] === undefined) currentPg -= 1;
	   getVids(pid, currentPg);
	}); 
  
    $('.prev').on('click', function(e) {
		$('#youtube-videos').html('');
		currentPg -= 1;
		getVids(pid, currentPg);
	});
	
	$('.page-numbers').on('click', function(e) {
		$('#youtube-videos').html('');
		currentPg = $(this).text() - 1;
		getVids(pid, currentPg);
	})
});

