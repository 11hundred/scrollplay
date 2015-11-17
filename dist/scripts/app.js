function setTimeline(t){lastFMArtistSearch(t.user.username),$(".track-title").html(t.user.username+' &mdash; "'+t.title+'"'),$(".comments-list").css("height",Math.round(t.duration*magnitude)),$(".comments-list .comment").remove(),$.get(host+"/tracks/"+t.id+"/comments?consumer_key="+consumerKey,function(t){t.sort(function(t,e){return parseFloat(t.timestamp)-parseFloat(e.timestamp)});for(var e,a=0,s=0;s<t.length;s++){var n=Math.round(t[s].timestamp*magnitude);a+e>n&&(n=a+e);var o=t[s].user.avatar_url;o=o.replace("-large.jpg","-badge.jpg"),$(".comments-list").append('<div id="comment-'+t[s].id+'" class="comment" style="top: '+n+'px;"><img class="avatar" src="'+o+'"><span class="comment-text">'+t[s].user.username+": "+t[s].body+"</span></div>"),e=$(".comments-list .comment").last().outerHeight(),a=n}})}function updateProgress(t){var e;e=t>=0?t:track.position;var a=e/track.durationEstimate;$(".bar-progress").css("width",100*a+"%"),$(".comments-progress").css("top",Math.round(a*$(window).height())+"px"),container.animate({scrollTop:a*$(".comments-list").outerHeight()},0)}function setPosition(t){track.setPosition(t),updateProgress(t)}function setArtwork(t){if(t.artwork_url){var e=t.artwork_url;e=e.replace("-large.jpg","-t500x500.jpg"),$(".image-bg-wrap").css("background-image","url("+e+")")}}function loadTrack(t,e){track&&track.destruct(),SC.initialize({client_id:consumerKey}),$(".search-wrap").toggleClass("hide"),$(".status-control").addClass("playing"),$(".track-title, .comments-list").html(),playingElements.removeClass("hide"),SC.whenStreamingReady(function(){track=SC.stream("/tracks/"+t,{autoPlay:!1},function(a){$.get(host+"/tracks/"+t+"?consumer_key="+consumerKey,function(t){$("body").addClass("trackloaded"),e||history.pushState("","New ID: "+t.id,"/#/"+t.id+"/"+t.permalink),document.title=t.title+" | ScrollPlay",setArtwork(t),setTimeline(t),a.play({whileplaying:function(){updateProgress()},onfinish:function(){$(".status-control").toggleClass("playing")}}),$(".header-top-row").removeClass("collapsed")}).fail(function(){playingElements.addClass("hide"),$(".search-toggle").trigger("click"),$(".search-results").addClass("filled").html("Track not found. Search again.")})})})}function loadTrackFromURL(t,e){var a=new RegExp("(#)/([0-9]+)");return a.exec(t)?(loadTrack(a.exec(t)[2],e),!0):!1}function lastFMArtistSearch(t){$.ajax({dataType:"json",url:"http://ws.audioscrobbler.com/2.0/?method=artist.search&api_key="+lastFMAPIKey+"&format=json&limit=1&artist="+t}).done(function(t){t.results.artistmatches.artist&&getArtistEvents(t.results.artistmatches.artist.name)})}function getArtistEvents(t){$.ajax({dataType:"json",url:"http://ws.audioscrobbler.com/2.0/?method=artist.getevents&api_key="+lastFMAPIKey+"&format=json&limit=3&autocorrect=1&artist="+encodeURI(t)}).done(function(e){if(e.events.event&&e.events.event.length>0){$(".events-list").addClass("show");for(var a="",s=0;s<e.events.event.length;s++){var n=new Date(e.events.event[s].startDate);a+="<li>",a+='<a class="event-link" href="'+e.events.event[s].url+'">',a+='<div class="cal-icon-wrap">',a+='<span class="fa-stack"><span class="fa-stack-1x date-text">'+n.getDate()+'</span><i class="fa fa-calendar-o fa-stack-2x"></i></span>',a+='<div class="month-title">'+monthNames[n.getMonth()]+"</div>",a+="</div>",a+='<div class="event-location">',e.events.event[s].title!=t&&(a+=e.events.event[s].title+" - "),a+=e.events.event[s].venue.location.city+", "+e.events.event[s].venue.location.country,a+="</div>",a+="</a>",a+="</li>"}$(".events-list ul").empty().append(a)}else $(".events-list").removeClass("show").find("ul").empty()})}var consumerKey="9994e3c432c77379bee441c98b1a4082",lastFMAPIKey="70eb62503565b422507f84fbf689cb18",host="https://api.soundcloud.com",magnitude=.1,container=$(".wrapper"),track,SC,playingElements=$(".progress-bar, .controls, .comments-progress"),monthNames=["Jan","Feb","Mar","Apr","May","Jun","Jul","Augt","Sep","Oct","Nov","Dec"];$(document).ready(function(){window.location.hash&&loadTrackFromURL(window.location.hash),$(".status-control").click(function(){track.position>=track.duration?loadTrack():track.togglePause(),$(this).toggleClass("playing")}),$(".comments-toggle").click(function(){$("body").toggleClass("comments-shown")}),$(".progress-bar").click(function(t){setPosition(t.pageX/$(window).width()*track.durationEstimate)}),$(".search-toggle").click(function(){$(".search-wrap").toggleClass("hide"),$("#search-input").focus()}),$("#search-input").bind("propertychange change click keyup input paste",function(){var t=$(this).val();0===t.length?($(".search-results").html(""),$(".search-results").removeClass("filled")):t.length>2&&SC.get("/tracks?consumer_key="+consumerKey,{q:t},function(t){var e="";if(t.length<=1)e="No tracks found.";else for(var a=0;5>a&&(t[a].streamable===!0&&(e+='<div class="search-track" data-trackid="'+t[a].id+'">',t[a].artwork_url&&(e+='<img src="'+t[a].artwork_url+'">'),e+='<div class="meta"><div class="meta-title">'+t[a].title+'</div><div class="meta-artist">by '+t[a].user.username+"</div></div></div>"),a!=t.length-1);a++);$(".search-results").addClass("filled"),$(".search-results").html(e).promise().done(function(){$(".search-track").click(function(){loadTrack($(this).data("trackid"))})})})}),$.fn.drags=function(t){t=$.extend({handle:"",cursor:"move"},t);var e;return e=""===t.handle?this:this.find(t.handle),e.css("cursor",t.cursor).on("mousedown",function(e){var a;$(this).addClass("hasDragged"),a=""===t.handle?$(this).addClass("draggable"):$(this).addClass("active-handle").parent().addClass("draggable");var s=a.css("z-index"),n=a.outerHeight(),o=a.outerWidth(),r=a.offset().top+n-e.pageY,i=a.offset().left+o-e.pageX;a.css("z-index",1e3).parents().on("mousemove",function(t){var e,l,c=$(window).width();$(window).height();e=t.pageX+i>c?c-o:a.position().left<0?0:t.pageX+i-o,l=a.position().top<0?0:t.pageY+r-n,$(".draggable").offset({top:l,left:e}).on("mouseup",function(){$(this).removeClass("draggable").css("z-index",s)})}),e.preventDefault()}).on("mouseup",function(){""===t.handle?$(this).removeClass("draggable"):$(this).removeClass("active-handle").parent().removeClass("draggable")})},$("header").drags()}),$(window).on("popstate",function(t){loadTrackFromURL(window.location.hash,!0),$(".search-wrap").addClass("hide")}),$("body").on("DOMMouseScroll mousewheel",function(t){return $("body").hasClass("trackloaded")&&setPosition(t.originalEvent.detail>0||t.originalEvent.wheelDelta<0?track.position+100:track.position-100),!1});
//# sourceMappingURL=app.js.map
