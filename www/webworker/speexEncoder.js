
if(typeof WEBPACK_BUILD !== 'undefined' && WEBPACK_BUILD){

	require('mmir-lib/workers/workerUtil');

	/**
	 * MIT license
	 * @see https://github.com/jpemartins/speex.js
	 */
	Flac = require('mmir-plugin-encoder-speex/speex');

	require('mmir-plugin-encoder-core/resampler');
	require('mmir-plugin-encoder-core/silenceDetector');
	require('mmir-plugin-encoder-core/encoder');

} else {

	importScripts('workerUtil.js');

	/**
	 * MIT license
	 * @see https://github.com/jpemartins/speex.js
	 */
	importScripts('speex.min.js');

	importScripts('resampler.js');
	importScripts('silenceDetector.js');
	importScripts('encoder.js');
}


function TheSpeexEncoder(){

	var bits = _malloc(Speex.types.SpeexBits.__size__);
    _speex_bits_init(bits);

    var encoder = _speex_encoder_init(_speex_lib_get_mode(1));
    var buffer_ptr = _malloc(320*2);
    var buffer = HEAP16.subarray(buffer_ptr/2, buffer_ptr/2+320);
    var out_buffer_ptr = _malloc(100);
    var out_buffer = HEAPU8.subarray(out_buffer_ptr, out_buffer_ptr+100);

	//target samplerate for encoding speex wb:
	var desiredSampleRate = 16000;

	console.log("speexEncoder loaded");

	this.codec = null;
	this.encoded;
	this.encoderInit = function(){
		//included in new Speex()

		//configure/initialize resampling via encoder.js:
		self.setConfig({targetSampleRate: desiredSampleRate});
		return;
	};
	this.encoderFinish = function(){
		return;
	};

	this.encoderCleanUp = function(){
		return;
	};


	this.resample = function (buffer){
		return self.doResample(buffer)
	};

	 this.encodeBuffer = function(buff){

		    //resample
		    var frame = this.resample(buff);

		    var offset = 0;

            var ret = [];
            var frame_offset = 0;
            while(frame_offset < frame.length){
                var size = Math.min(320-offset, frame.length-frame_offset);
                for(var i=0; i<size; i++){
                    buffer[offset+i] = frame[frame_offset+i] * 32767.0;
                }
                frame_offset += size;
                offset += size;
                if(offset<320){
                    break;
                }
                offset = 0;
                var status = _speex_encode_int(encoder,buffer_ptr,bits);
                var count = _speex_bits_nbytes(bits);
                status = _speex_bits_write(bits,out_buffer_ptr,count);
                status = _speex_bits_reset(bits);
                var out_frame = new Uint8Array(count);
                out_frame.set(out_buffer.subarray(0,count));
                ret.push(out_frame);
            }

		    this.encoded = ret;

	    };
}

//export into global instance variable (see encoder.js for sending/receiving messages on this)
encoderInstance = new TheSpeexEncoder();
// console.log("TheSpeexEncoder() called");
