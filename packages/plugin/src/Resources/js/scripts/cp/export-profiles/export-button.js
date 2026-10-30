(()=>{var c=$("#toolbar"),d=$(`
<div>
  <button type="button" class="btn" id="quick-export" data-icon="download">
    ${Craft.t("freeform","Quick Export")}
  </button>
</div>
`);c.prepend(d);$("#quick-export",d).on({click:()=>{var a;let t=$("#sidebar").find("li a[data-key].sel").data("key"),o=null;/^form:\d+/i.test(t)&&(o=parseInt(t.replace("form:",""),10)),$.ajax({url:Craft.getCpUrl("freeform/export/export-dialogue"),type:"get",data:{formId:o,isSpam:(a=window.freeformSpamView)!=null?a:!1},success:l=>{let r=$('<div id="export-modal-wrapper" class="modal fitted">');r.html(l);let i=$("#export-modal-wrapper"),n=new Garnish.Modal(r,{onHide:()=>{setTimeout(()=>{$("#export-modal-wrapper").remove(),$(".modal-shade").remove()},10)},onShow:()=>{let e=$("#export-modal-wrapper");$(".checkbox-select",e).each(function(){$(this).data("dragger")||($(this).data("dragger",!0),new Garnish.DragSort($("div",$(this)),{handle:".move",axis:"y"}))}),$(".btn.submit",e).on({click:()=>{e.data("modal").hide()}}),$(".btn.cancel",e).on({click:()=>{e.data("modal").hide()}}),$("select[name=form_id]",e).on({change:function(){let s=$(this).val();$(".form-field-list").addClass("hidden"),$(`.form-field-list[data-id=${s}]`).removeClass("hidden")}})}});i.data("modal",n)}})}});})();
