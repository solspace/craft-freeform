(()=>{var c=$("#toolbar"),t=$(`
<div>
  <button type="button" class="btn" id="quick-export" aria-haspopup="dialog">
    ${Craft.t("freeform","Quick Export")}
  </button>
</div>
`);c.prepend(t);$("#quick-export",t).on({click:()=>{var r;let o=$("#sidebar").find("li a[data-key].sel").data("key"),a=null;/^form:\d+/i.test(o)&&(a=parseInt(o.replace("form:",""),10)),$.ajax({url:Craft.getCpUrl("freeform/export/export-dialogue"),type:"get",data:{formId:a,isSpam:(r=window.freeformSpamView)!=null?r:!1},success:i=>{let d=$('<div id="export-modal-wrapper" class="modal fitted">');d.html(i);let l=$("#export-modal-wrapper"),n=new Garnish.Modal(d,{onHide:()=>{t.find("#quick-export").trigger("focus"),setTimeout(()=>{$("#export-modal-wrapper").remove(),$(".modal-shade").remove()},10)},onShow:()=>{let e=$("#export-modal-wrapper");$(".checkbox-select",e).each(function(){$(this).data("dragger")||($(this).data("dragger",!0),new Garnish.DragSort($("div",$(this)),{handle:".move",axis:"y"}))}),$(".btn.submit",e).on({click:()=>{e.data("modal").hide()}}),$(".btn.cancel",e).on({click:()=>{e.data("modal").hide()}}),$("select[name=form_id]",e).on({change:function(){let s=$(this).val();$(".form-field-list").addClass("hidden"),$(`.form-field-list[data-id=${s}]`).removeClass("hidden")}})}});l.data("modal",n)}})}});})();
