$((function(){var e=$("select#class");e.on({change:function(){var e=$(this).val().split("\\").join("");$("div#properties-"+e).show().siblings().hide()}}),e.trigger("change");var r=$("#name");r.get(0)&&!r.val().length&&r.on({keyup:function(){$("#handle").val(function(e){var r=e.replace("/<(.*?)>/g","");r=(r=r.replace(/['"‘’“”[\](){}:]/g,"")).toLowerCase(),r=(r=Craft.asciiString(r)).replace(/^[^a-z]+/,"");var a=Craft.filterArray(r.split(/[^a-z0-9]+/));r="";for(var t=0;t<a.length;t++)r+=0===t?a[t]:a[t].charAt(0).toUpperCase()+a[t].substr(1);return r}($(this).val())).trigger("change")}});var a=$("#auth-checker"),t=$(".pending-status-check",a),s=t.data("id"),i=t.data("type");if(s){var n={id:s};n[Craft.csrfTokenName]=Craft.csrfTokenValue,$.ajax({url:Craft.getCpUrl("freeform/".concat(i,"/check")),data:n,type:"post",dataType:"json",success:function(e){if(t.hide(),e.success)$(".authorized",a).show();else if($(".not-authorized",a).show(),e.errors){var r=e.errors;"string"!=typeof r&&(r=r.join(". ")),$(".not-authorized .errors",a).empty().text(r)}}})}}));