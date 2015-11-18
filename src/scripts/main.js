var client_id = '9994e3c432c77379bee441c98b1a4082';
var lastFMAPIKey = '70eb62503565b422507f84fbf689cb18';
var host = 'https://api.soundcloud.com';
var magnitude = 0.10;
var container = $('.wrapper');
var track, SC;
var activeTrackDuration = 0;
var playingElements = $('.progress-bar, .controls, .comments-progress');
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Augt', 'Sep', 'Oct', 'Nov', 'Dec'];

function setTimeline(data) {
  //lastFMArtistSearch(data.user.username);
  $('.track-title').html(data.user.username + ' &mdash; "' + data.title + '"');
  $('.comments-list').css('height', Math.round(data.duration * magnitude));
  $('.comments-list .comment').remove();
  $.get(host + '/tracks/' + data.id + '/comments?client_id=' + client_id, function(data) {
    data.sort(function(a,b) { return parseFloat(a.timestamp) - parseFloat(b.timestamp); } );
    var lastCommentTop = 0;
    var lastHeight;
    for (var i = 0; i < data.length; i++) {
      var thisTop = Math.round(data[i].timestamp * magnitude);
      if (thisTop < lastCommentTop + lastHeight) {
        thisTop = lastCommentTop + lastHeight;
      }
      var userAvatar = data[i].user.avatar_url;
      userAvatar = userAvatar.replace('-large.jpg', '-badge.jpg');
      $('.comments-list').append('<div id="comment-' + data[i].id + '" class="comment" style="top: ' + thisTop + 'px;"><img class="avatar" src="' + userAvatar + '"><span class="comment-text">' + data[i].user.username + ': ' + data[i].body + '</span></div>');
      lastHeight = $('.comments-list .comment').last().outerHeight();
      lastCommentTop = thisTop;
    }
  });
}

function updateProgress(givenposition) {

  var newposition;
  if (givenposition >= 0) {
    newposition = givenposition;
  } else {
    newposition = track.currentTime();
  }

  var percentComplete = newposition / activeTrackDuration;

  $('.bar-progress').css('width', percentComplete * 100 + '%');
  $('.comments-progress').css('top', Math.round(percentComplete * $(window).height()) + 'px');

  container.animate({
    scrollTop: percentComplete * $('.comments-list').outerHeight()
  }, 0);
}

function setPosition(newposition) {
  track.seek(newposition);
  updateProgress(newposition);
}

function setArtwork(data) {
  if (data.artwork_url) {
    var tempArtwork = data.artwork_url;
    tempArtwork = tempArtwork.replace('-large.jpg', '-t500x500.jpg');
    $('.image-bg-wrap').css('background-image', 'url(' + tempArtwork + ')');
  }
}

function loadTrack(trackID, isHistory) {

  /*if (track) {
    track.destruct();
  }*/

  $('.search-wrap').toggleClass('hide');
  $('.status-control').addClass('playing');

  $('.track-title, .comments-list').html();
  playingElements.removeClass('hide');

  SC.stream('/tracks/' + trackID).then(function(player) {

    track = player;
    $.get(host + '/tracks/' + trackID + '?client_id=' + client_id, function(data) {
      $('body').addClass('trackloaded');
      if (!isHistory) {
        history.pushState('', 'New ID: ' + data.id, '/#/' + data.id + '/' + data.permalink);
      }
      document.title = data.title + ' | ScrollPlay';
      setArtwork(data);
      setTimeline(data);
      activeTrackDuration = data.duration;
      player.play();
      player.on('time', function() {
        updateProgress();
      });
      player.on('finish', function() {
        $('.status-control').toggleClass('playing');
      });
      $('.header-top-row').removeClass('collapsed');
    }).fail(function(error) {
      playingElements.addClass('hide');
      $('.search-toggle').trigger('click');
      $('.search-results').addClass('filled').html('Track not found. Search again.');
    });
  });
}

function loadTrackFromURL(url, isHistory) {
  var regexTrack = new RegExp('(#)\/([0-9]+)');
  if (regexTrack.exec(url)) {
    loadTrack(regexTrack.exec(url)[2], isHistory);
    return true;
  } else {
    return false;
  }
}

function lastFMArtistSearch(username) {
  $.ajax({
    dataType: 'json',
    url: 'http://ws.audioscrobbler.com/2.0/?method=artist.search&api_key=' + lastFMAPIKey + '&format=json&limit=1&artist=' + username
  }).done(function(data) {
    if (data.results.artistmatches.artist) {
      getArtistEvents(data.results.artistmatches.artist.name);
    }
  });
}

function getArtistEvents(lastFMArtistName) {
  $.ajax({
    dataType: 'json',
    url: 'http://ws.audioscrobbler.com/2.0/?method=artist.getevents&api_key=' + lastFMAPIKey + '&format=json&limit=3&autocorrect=1&artist=' + encodeURI(lastFMArtistName)
  }).done(function(data) {
    if (data.events.event && data.events.event.length > 0) {
      $('.events-list').addClass('show');
      var tempItems = '';
      for (var i = 0; i < data.events.event.length; i++) {
        var tempDate = new Date(data.events.event[i].startDate);
        tempItems += '<li>';
          tempItems += '<a class="event-link" href="' + data.events.event[i].url + '">';
          tempItems += '<div class="cal-icon-wrap">';
            tempItems += '<span class="fa-stack"><span class="fa-stack-1x date-text">' + tempDate.getDate() + '</span><i class="fa fa-calendar-o fa-stack-2x"></i></span>';
            tempItems += '<div class="month-title">' + monthNames[tempDate.getMonth()] + '</div>';
          tempItems += '</div>';
          tempItems += '<div class="event-location">';
            if (data.events.event[i].title != lastFMArtistName) {
              tempItems += data.events.event[i].title + ' - ';
            }
            tempItems += data.events.event[i].venue.location.city + ', ' + data.events.event[i].venue.location.country;
          tempItems += '</div>';
          tempItems += '</a>';
        tempItems += '</li>';
      }
      $('.events-list ul').empty().append(tempItems);
    } else {
      $('.events-list').removeClass('show').find('ul').empty();
    }
  });
}

$(document).ready(function() {

  SC.initialize({
    client_id: client_id,
    redirect_uri: 'http://scrollplay.co'
  });

  if (window.location.hash) {
    loadTrackFromURL(window.location.hash);
  }

  $('.status-control').click(function() {
    if (track.currentTime() >= activeTrackDuration) {
      loadTrack();
    } else if ($(this).hasClass('playing')) {
      track.pause();
    } else {
      track.play();
    }
    $(this).toggleClass('playing');
  });

  $('.comments-toggle').click(function() {
    $('body').toggleClass('comments-shown');
  });

  $('.progress-bar').click(function(e) {
    setPosition((e.pageX / $(window).width()) * activeTrackDuration);
  });

  $('.search-toggle').click(function() {
    $('.search-wrap').toggleClass('hide');
    $('#search-input').focus();
  });

  $('#search-input').bind('propertychange change click keyup input paste', function() {
    var searchQuery = $(this).val();
    if (searchQuery.length === 0) {
      $('.search-results').html('');
      $('.search-results').removeClass('filled');
    } else if (searchQuery.length > 2) {
      SC.get('/tracks', {
        q: searchQuery
      }).then(function(tracks) {
        var searchResultsHTML = '';
        if (tracks.length <= 1) {
          searchResultsHTML = 'No tracks found.';
        } else {
          for (var i = 0; i < 5; i++) {
            if (tracks[i].streamable === true) {
              searchResultsHTML += '<div class="search-track" data-trackid="' + tracks[i].id + '">';
              if (tracks[i].artwork_url) {
                searchResultsHTML += '<img src="' + tracks[i].artwork_url + '">';
              }
              searchResultsHTML += '<div class="meta"><div class="meta-title">' + tracks[i].title + '</div><div class="meta-artist">by ' + tracks[i].user.username + '</div></div></div>';
            }
            if (i == tracks.length - 1) {
              break;
            }
          }
        }
        $('.search-results').addClass('filled');
        $('.search-results').html(searchResultsHTML).promise().done(function() {
          $('.search-track').click(function() {
            loadTrack($(this).data('trackid'));
          });
        });
      }).catch(function(error) {
        console.log('Error: ' + error.message);
      });
    }
  });

  $.fn.drags = function(opt) {
  	opt = $.extend({
  		handle: '',
  		cursor: 'move'
  	}, opt);

    var $el;

  	if (opt.handle === '') {
      $el = this;
  	} else {
      $el = this.find(opt.handle);
  	}

  	return $el.css('cursor', opt.cursor).on('mousedown', function(e) {
      var $drag;
      $(this).addClass('hasDragged');
  		if (opt.handle === '') {
        $drag = $(this).addClass('draggable');
  		} else {
        $drag = $(this).addClass('active-handle').parent().addClass('draggable');
  		}
  		var z_idx = $drag.css('z-index'),
  			drg_h = $drag.outerHeight(),
  			drg_w = $drag.outerWidth(),
  			pos_y = $drag.offset().top + drg_h - e.pageY,
  			pos_x = $drag.offset().left + drg_w - e.pageX;
  		$drag.css('z-index', 1000).parents().on('mousemove', function(e) {
        var finalX;
        var finalY;
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        if (e.pageX + pos_x > windowWidth) {
          finalX = windowWidth - drg_w;
        } else if ($drag.position().left < 0) {
          finalX = 0;
        } else {
          finalX = e.pageX + pos_x - drg_w;
        }
        if ($drag.position().top < 0) {
          finalY = 0;
        } else {
          finalY = e.pageY + pos_y - drg_h;
        }
  			$('.draggable').offset({
  				top: finalY,
  				left: finalX
  			}).on('mouseup', function() {
  				$(this).removeClass('draggable').css('z-index', z_idx);
  			});
  		});
  		e.preventDefault();
  	}).on('mouseup', function() {
  		if (opt.handle === '') {
  			$(this).removeClass('draggable');
  		} else {
  			$(this).removeClass('active-handle').parent().removeClass('draggable');
  		}
  	});

  };

  $('header').drags();

});

$(window).on('popstate', function(e) {
  loadTrackFromURL(window.location.hash, true);
  $('.search-wrap').addClass('hide');
});

$('body').on('DOMMouseScroll mousewheel', function(e) {
  if ($('body').hasClass('trackloaded')) {
    if (e.originalEvent.detail > 0 || e.originalEvent.wheelDelta < 0) {
      setPosition(track.currentTime() + 100);
    } else {
      setPosition(track.currentTime() - 100);
    }
  }
  return false;
});
