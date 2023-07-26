export const newCompositionModal = `
<div class="modal fade" id="newMusicModal" tabindex="-1" aria-labelledby="newMusicModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="newMusicModalLabel">New Music</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label id="" for="newcomptitle">Title:</label> 
                    <div class="container">
                        <div class="row justify-center">
                            <div class="input-group mb-3">  
                                <input type="text" class="newtitle" id="newcomptitle" placeholder="new music title" title="newcomptitle">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label id="" for="listCompCollsFormControl">Select parent collection:</label>
                    <div class="container">
                        <div class="row justify-center">
                          <div class="">
                            <div id="listCollContainerNewComp" class="input-group mb-3"></div>
                          </div>
                        </div>
                      </div>
                </div>
                <div class="form-group">
                    <label for="newMusicFormControl">Level of Privacy:</label>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="newMusicPrivacyRadios" id="newMusicPrivacyRadios1" value="1" checked>
                        <label class="form-check-label" for="newMusicPrivacyRadios1">
                          Public
                        </label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="newMusicPrivacyRadios" id="newMusicPrivacyRadios2" value="2">
                        <label class="form-check-label" for="newMusicPrivacyRadios2">
                          Only registered users
                        </label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="newMusicPrivacyRadios" id="newMusicPrivacyRadios3" value="3">
                        <label class="form-check-label" for="newMusicPrivacyRadios3">
                          Private
                        </label>
                      </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                <button id="newcomposition" type="button" class="btn btn-primary">Save</button>
            </div>
        </div>
    </div>
</div>`