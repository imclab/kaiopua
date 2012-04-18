/*
 *
 * ObjectHelper.js
 * Contains utility functionality for basic models.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/utils/ObjectHelper.js",
		_ObjectHelper = {},
		_MathHelper,
		utilVec31Follow,
		utilVec32Follow,
		utilVec31Bounds,
		utilVec32Bounds,
		utilVec31Dimensions,
		utilVec31Axis,
		utilVec31Offset,
		utilVec31OffsetRot,
		utilVec31Normalize,
		utilVec32Normalize,
		utilVec33Normalize,
		utilVec34Normalize,
		utilVec41Normalize,
		utilQ1Follow,
		utilQ2Follow,
		utilQ3Follow,
		utilQ4Follow,
		utilQ1Axis,
		utilQ1ApplyQ,
		utilQ2ApplyQ,
		utilQ1Normalize,
		utilMat41Follow,
		utilMat41Bounds,
		utilMat41Center,
		utilMat41ApplyQ;
    
    /*===================================================
    
    public properties
    
    =====================================================*/
	
	_ObjectHelper.extract_children_from_objects = extract_children_from_objects;
	_ObjectHelper.extract_parents_from_objects = extract_parents_from_objects;
	
	_ObjectHelper.dimensions = dimensions;
	
	_ObjectHelper.push_bounds = push_bounds;
	
	_ObjectHelper.apply_matrix = apply_matrix;
	_ObjectHelper.apply_quaternion = apply_quaternion;
	
	_ObjectHelper.center_offset = center_offset;
	_ObjectHelper.object_center = object_center;
	
	_ObjectHelper.q_to_axis = q_to_axis;
	_ObjectHelper.rotation_offset = rotation_offset;
	_ObjectHelper.center_rotation = center_rotation;
	
	_ObjectHelper.normalize_faces = normalize_faces
	
	_ObjectHelper.object_follow_object = object_follow_object;
	
	main.asset_register( assetPath, {
		data: _ObjectHelper,
		requirements: [
			"assets/modules/utils/MathHelper.js"
		],
		callbacksOnReqs: init_internal,
		wait: true
	} );
	
	/*===================================================
    
    internal init
    
    =====================================================*/
	
	function init_internal ( mh ) {
		console.log('internal object helper');
		var len = Math.sqrt( 1 / 2 ),
			ca = shared.cardinalAxes,
			right = ca.right,
			forward = ca.forward;
			
		_ObjectHelper.expectedVertPosA = new THREE.Vector3( right.x * -len, 0, forward.z * len ),//( right.x * len, 0, forward.z * -len ),
		_ObjectHelper.expectedVertPosB = new THREE.Vector3( right.x * -len, 0, forward.z * -len ),//( right.x * len, 0, forward.z * len ),
		_ObjectHelper.expectedVertPosC = new THREE.Vector3( right.x * len, 0, forward.z * -len ),//( right.x * -len, 0, forward.z * len ),
		_ObjectHelper.expectedVertPosD = new THREE.Vector3( right.x * len, 0, forward.z * len );//( right.x * -len, 0, forward.z * -len );
		
		_MathHelper = mh;
		
		// utility
		
		utilVec31Follow = new THREE.Vector3();
		utilVec32Follow = new THREE.Vector3();
		utilVec31Bounds = new THREE.Vector3();
		utilVec32Bounds = new THREE.Vector3();
		utilVec31Dimensions = new THREE.Vector3();
		utilVec31Axis = new THREE.Vector3();
		utilVec31Offset = new THREE.Vector3();
		utilVec31OffsetRot = new THREE.Vector3();
		utilVec31Normalize = new THREE.Vector3();
		utilVec32Normalize = new THREE.Vector3();
		utilVec33Normalize = new THREE.Vector3();
		utilVec34Normalize = new THREE.Vector3();
		utilVec41Normalize = new THREE.Vector4();
		utilQ1Follow = new THREE.Quaternion();
		utilQ2Follow = new THREE.Quaternion();
		utilQ3Follow = new THREE.Quaternion();
		utilQ4Follow = new THREE.Quaternion();
		utilQ1Axis = new THREE.Quaternion();
		utilQ1ApplyQ = new THREE.Quaternion();
		utilQ2ApplyQ = new THREE.Quaternion();
		utilQ1Normalize = new THREE.Quaternion();
		utilMat41Follow = new THREE.Matrix4();
		utilMat41Bounds = new THREE.Matrix4();
		utilMat41Center = new THREE.Matrix4();
		utilMat41ApplyQ = new THREE.Matrix4();
		
	}
	
	/*===================================================
    
    hierarchy support
    
    =====================================================*/
	
	function extract_children_from_objects ( objects, cascade ) {
		
		var i, l,
			object;
		
		objects = main.ensure_array( objects );
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			cascade = extract_child_cascade( objects[ i ], cascade );
			
		}
		
		return cascade;
		
	}
	
	function extract_child_cascade ( object, cascade ) {
		
		var i, l,
			children;
		
		cascade = main.ensure_array( cascade );
			
		if ( typeof object !== 'undefined' ) {
			
			children = object.children;
			
			cascade = cascade.concat( children );
			
			for ( i = 0, l = children.length; i < l; i++ ) {
				
				cascade = extract_child_cascade( children[ i ], cascade );
				
			}
			
		}
		
		return cascade;
		
	}
	
	function extract_parents_from_objects ( objects, cascade ) {
		
		var i, l;
		
		objects = main.ensure_array( objects );
		
		for ( i = 0, l = objects.length; i < l; i++ ) {
			
			cascade = extract_parent_cascade( objects[ i ], cascade );
			
		}
		
		return cascade;
		
	}
	
	function extract_parent_cascade ( object, cascade ) {
		
		var i, l;
		
		cascade = cascade || [];
		
		while( typeof object.parent !== 'undefined' ) {
			
			cascade.push( object.parent );
			
			object = object.parent;
			
		}
		
		return cascade;
		
	}
	
	/*===================================================
    
    dimensions
    
    =====================================================*/
	
	function dimensions ( object, ignoreScale ) {
		
		var mesh = object instanceof THREE.Mesh ? object : false,
			geometry = mesh ? mesh.geometry : object,
			dimensions = utilVec31Dimensions,
			bbox;
		
		// if needs calculation
		
		if ( typeof geometry.boundingBox !== 'undefined' ) {
			geometry.computeBoundingBox();
		}
		
		bbox = geometry.boundingBox;
		
		if ( bbox ) {
			
			// get original dimensions
			
			dimensions.set( bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z );
			
			// scale to mesh's scale
			
			if ( ignoreScale !== true && mesh ) {
				
				dimensions.multiplySelf( mesh.scale );
				
			}
			
		}
		else {
			
			dimensions.set( 0, 0, 0 );
			
		}
		
		return dimensions;
		
	}
	
	/*===================================================
    
    bounds
    
    =====================================================*/
	
	function push_bounds ( object, bounds ) {
		
		var geometry = object instanceof THREE.Mesh ? object.geometry : object,
			objectWorldMatrix = object instanceof THREE.Mesh ? object.matrixWorld : utilMat41Bounds,
			objectBounds,
			objectMin = utilVec31Bounds,
			objectMax = utilVec32Bounds,
			min = bounds.min,
			max = bounds.max;
		
		if ( !geometry.boundingBox ) {
			
			geometry.computeBoundingBox();
			
		}
		
		objectBounds = geometry.boundingBox;
		objectMin.copy( objectBounds.min );
		objectMax.copy( objectBounds.max );
		
		objectWorldMatrix.multiplyVector3( objectMin );
		objectWorldMatrix.multiplyVector3( objectMax );
		
		if ( objectMin.x < min.x ) {
			
			min.x = objectMin.x;
			
		}
		
		if ( objectMax.x > max.x ) {
			
			max.x = objectMax.x;
			
		}
		
		if ( objectMin.y < min.y ) {
			
			min.y = objectMin.y;
			
		}
		
		if ( objectMax.y > max.y ) {
			
			max.y = objectMax.y;
			
		}
		
		if ( objectMin.z < min.z ) {
			
			min.z = objectMin.z;
			
		}
		
		if ( objectMax.z > max.z ) {
			
			max.z = objectMax.z;
			
		}
		
		return bounds;
		
	}
	
	/*===================================================
    
    apply
    
    =====================================================*/
	
	function apply_matrix ( object, matrix ) {
		
		var i, l,
			j, k,
			geometry = object instanceof THREE.Mesh ? object.geometry : object,
			morphTargets = geometry.morphTargets,
			morphTarget,
			vertices,
			vertex;
		
		// apply offset matrix to geometry
		
		geometry.applyMatrix( matrix );
		
		// adjust morph targets
		
		for ( i = 0, l = morphTargets.length; i < l; i++ ) {
			
			morphTarget = morphTargets[ i ];
			
			vertices = morphTarget.vertices;
			
			for ( j = 0, k = vertices.length; j < k; j++ ) {
				
				vertex = vertices[ j ];
				
				matrix.multiplyVector3( vertex.position );
				
			}
			
		}
		
		// force recompute bounds
		
		geometry.computeBoundingSphere();
		
		geometry.computeBoundingBox();
		
		// additional adjustments if object is mesh
		
		if ( object instanceof THREE.Mesh ) {
			
			object.boundRadius = geometry.boundingSphere.radius;
			
		}
		
	}
	
	function apply_quaternion ( object, quaternion, invisible, reverse ) {
		
		var matrix = utilMat41ApplyQ.setRotationFromQuaternion( quaternion ),
			objectQ = utilQ1ApplyQ;
			objectNewQ = utilQ2ApplyQ;
		
		// apply matrix to object
		
		apply_matrix( object, matrix );
		
		// additional adjustments if object is mesh
		
		if ( invisible === true && object instanceof THREE.Mesh ) {
			
			// get object quaternion
			
			if ( object.useQuaternion === true ) {
				
				objectQ = object.quaternion;
				
			}
			else {
				
				objectQ.setFromRotationMatrix( object.matrix );
				
			}
			
			// multiply
			
			if ( reverse === true ) {
				
				objectNewQ.multiply( objectQ, quaternion.inverse() );
				
			}
			else {
				
				objectNewQ.multiply( quaternion.inverse(), objectQ );
				
			}
			
			// apply
			
			if ( object.useQuaternion === true ) {
				
				object.quaternion.copy( objectNewQ );
			
			}
			else {
				
				object.matrix.setRotationFromQuaternion( objectNewQ );
				
			}
			
		}
		
	}
	
	/*===================================================
    
    center offset
    
    =====================================================*/
	
	function center_offset ( object ) {
		
		var geometry = object instanceof THREE.Mesh ? object.geometry : object,
			offset = utilVec31Offset,
			bbox;
		
		if ( !geometry.boundingBox ) {
			
			geometry.computeBoundingBox();
			
		}
		
		bbox = geometry.boundingBox;
		
		offset.add( bbox.min, bbox.max ).multiplyScalar( -0.5 );
		
		return offset;
		
	}
	
	function object_center ( object ) {
		
		var offset = center_offset( object ),
			offsetMat4 = utilMat41Center.setTranslation( offset.x, offset.y, offset.z );
		
		// apply offset
		
		apply_matrix( object, offsetMat4 );
		
		// additional adjustments if object is mesh
		
		if ( object instanceof THREE.Mesh ) {
			
			// adjust position
			
			object.position.subSelf( offset );
			
		}
		
		return offset;
		
	}
	
	/*===================================================
    
    rotation offset
    
    =====================================================*/
	
	function q_to_axis ( axisTo, axisFrom, axisFromRightAngle ) {
		
		var ca = shared.cardinalAxes,
			dist,
			axis = utilVec31Axis,
			angle,
			qToA = utilQ1Axis;
		
		// current axes
		
		axisFrom = axisFrom || ca.up;
		
		axisFromRightAngle = axisFromRightAngle || ca.forward;
		
		// find dist between current axis up and average of normals
		
		dist = _MathHelper.clamp( axisFrom.dot( axisTo ), -1, 1 );
		
		// if up axes are not same
		
		if ( dist !== 1 ) {
			
			// axis / angle
			
			angle = Math.acos( dist );
			axis.cross( axisFrom, axisTo ).normalize();
			
			// if new axis is exactly opposite of current
			// replace new axis with the forward axis
			
			if ( axis.length() === 0 ) {
				
				axis.copy( axisFromRightAngle );
				
			}
			
			// rotation change
			
			qToA.setFromAxisAngle( axis, angle );
			
		}
		else {
			
			qToA.set( 0, 0, 0, 1 );
			
		}
		
		return qToA;
		
	}
	
	function rotation_offset ( object, axisUp, axisForward ) {
		
		var i, l,
			geometry = object instanceof THREE.Mesh ? object.geometry : object,
			faces = geometry.faces,
			vertices = geometry.vertices,
			face,
			normalAvg = utilVec31OffsetRot.set( 0, 0, 0 ),
			ca = shared.cardinalAxes,
			offset;
		
		// for all face normals
		
		for ( i = 0, l = faces.length; i < l; i++ ) {
			
			face = faces[ i ];
			
			normalAvg.addSelf( face.normal );
			
		}
		
		// find average
		
		normalAvg.normalize();
		
		// handle axes
		// use physics axis if available, or default to global up
		
		axisUp = axisUp || ( ( typeof object.physics !== 'undefined' ) ? object.physics.axes.up : ca.up );
		axisForward = axisForward || ( ( typeof object.physics !== 'undefined' ) ? object.physics.axes.forward : ca.forward );
		
		// find quaternion to go from average of normals to current axis up 
		
		offset = q_to_axis( axisUp, normalAvg, axisForward );
		
		return offset;
		
	}
	
	function center_rotation ( object ) {
		
		apply_quaternion( object, rotation_offset( object ), true );
		
	}
	
	/*===================================================
    
    face normalization
    
    =====================================================*/
	
	function normalize_faces ( object ) {
		
		// face must lie along xz axis with normal in y direction
		// TODO: account for faces with other orientations
		
		// sort object vertices
		
		sort_vertices ( object );
		
		// correct vertex rotation
		
		correct_for_vertex_rotation( object );
		
	}
	
	function sort_vertices ( object ) {
		
		var i, l,
			geometry = object instanceof THREE.Mesh ? object.geometry : object,
			faces = geometry.faces,
			vertices = geometry.vertices,
			faceVertexUvsList = geometry.faceVertexUvs[ 0 ],
			faceVertexUvs,
			face,
			epa = _ObjectHelper.expectedVertPosA,
			epb = _ObjectHelper.expectedVertPosB,
			epc = _ObjectHelper.expectedVertPosC,
			epd = _ObjectHelper.expectedVertPosD,
			ia, ib, ic, id,
			va, vb, vc, vd,
			pa, pb, pc, pd,
			npa = utilVec31Normalize,
			npb = utilVec32Normalize,
			npc = utilVec33Normalize,
			npd = utilVec34Normalize,
			cpa, cpb, cpc, cpd,
			uva, uvb, uvc, uvd,
			faceVertexOrder,
			axis = new THREE.Vector3( 0, 1, 0 ),
			angle = 0,
			sortRotOffset = utilQ1Normalize;
		
		// for all faces
		
		for ( i = 0, l = faces.length; i < l; i++ ) {
			
			face = faces[ i ];
			//console.log('face normal', face.normal.x.toFixed(4), face.normal.y.toFixed(4), face.normal.z.toFixed(4) );
			faceVertexOrder = [ 'a', 'b', 'c', 'd' ];
			
			ia = face.a;
			ib = face.b;
			ic = face.c;
			
			va = vertices[ ia ];
			vb = vertices[ ib ];
			vc = vertices[ ic ];
			
			pa = va.position;
			pb = vb.position;
			pc = vc.position;
					
			npa.copy( pa ).normalize();
			npb.copy( pb ).normalize();
			npc.copy( pc ).normalize();
			
			faceVertexUvs = faceVertexUvsList[ i ];
			
			uva = faceVertexUvs[ 0 ];
			uvb = faceVertexUvs[ 1 ];
			uvc = faceVertexUvs[ 2 ];
			
			if ( face instanceof THREE.Face4 ) {
				
				id = face.d;
				vd = vertices[ id ];
				pd = vd.position;
				npd.copy( pd ).normalize();
				uvd = faceVertexUvs[ 3 ];
				
				/*console.log(' > face vert A', npa.x.toFixed(4), npa.y.toFixed(4), npa.z.toFixed(4) );
				console.log(' > face vert B', npb.x.toFixed(4), npb.y.toFixed(4), npb.z.toFixed(4) );
				console.log(' > face vert C', npc.x.toFixed(4), npc.y.toFixed(4), npc.z.toFixed(4) );
				console.log(' > face vert D', npd.x.toFixed(4), npd.y.toFixed(4), npd.z.toFixed(4) );
				console.log(' ');*/
				
				cpa = get_vector_with_least_distance_to_source( epa, npa, npb, npc, npd );
				cpb = get_vector_with_least_distance_to_source( epb, npa, npb, npc, npd );
				cpc = get_vector_with_least_distance_to_source( epc, npa, npb, npc, npd );
				cpd = get_vector_with_least_distance_to_source( epd, npa, npb, npc, npd );
				
				// new vertex a
				
				if ( cpa === npb ) {
					
					//vertices[ ia ] = vb;
					face.a = ib;
					//faceVertexUvs[ 0 ] = uvb;
					faceVertexOrder[ 0 ] = 'b';
					
				}
				else if ( cpa === npc ) {
					
					//vertices[ ia ] = vc;
					face.a = ic;
					//faceVertexUvs[ 0 ] = uvc;
					faceVertexOrder[ 0 ] = 'c';
					
				}
				else if ( cpa ===  npd ) {
					
					//vertices[ ia ] = vd;
					face.a = id;
					//faceVertexUvs[ 0 ] = uvd;
					faceVertexOrder[ 0 ] = 'd';
					
				}
				
				// new vertex b
				
				if ( cpb === npa ) {
					
					//vertices[ ib ] = va;
					face.b = ia;
					//faceVertexUvs[ 1 ] = uva;
					faceVertexOrder[ 1 ] = 'a';
					
				}
				else if ( cpb === npc ) {
					
					//vertices[ ib ] = vc;
					face.b = ic;
					//faceVertexUvs[ 1 ] = uvc;
					faceVertexOrder[ 1 ] = 'c';
					
				}
				else if ( cpb ===  npd ) {
					
					//vertices[ ib ] = vd;
					face.b = id;
					//faceVertexUvs[ 1 ] = uvd;
					faceVertexOrder[ 1 ] = 'd';
					
				}
				
				// new vertex c
				
				if ( cpc === npa ) {
					
					//vertices[ ic ] = va;
					face.c = ia;
					//faceVertexUvs[ 2 ] = uva;
					faceVertexOrder[ 2 ] = 'a';
					
				}
				else if ( cpc === npb ) {
					
					//vertices[ ic ] = vb;
					face.c = ib;
					//faceVertexUvs[ 2 ] = uvb;
					faceVertexOrder[ 2 ] = 'b';
					
				}
				else if ( cpc ===  npd ) {
					
					//vertices[ ic ] = vd;
					face.c = id;
					//faceVertexUvs[ 2 ] = uvd;
					faceVertexOrder[ 2 ] = 'd';
					
				}
				
				// new vertex d
				
				if ( cpd === npa ) {
					
					//vertices[ id ] = va;
					face.d = ia;
					//faceVertexUvs[ 3 ] = uva;
					faceVertexOrder[ 3 ] = 'a';
					
				}
				else if ( cpd === npb ) {
					
					//vertices[ id ] = vb;
					face.d = ib;
					//faceVertexUvs[ 3 ] = uvb;
					faceVertexOrder[ 3 ] = 'b';
					
				}
				else if ( cpd ===  npc ) {
					
					//vertices[ id ] = vc;
					face.d = ic;
					//faceVertexUvs[ 3 ] = uvc;
					faceVertexOrder[ 3 ] = 'c';
					
				}
				
				if ( faceVertexOrder[ 0 ] === 'd' ) {
					angle += Math.PI * 0.5;
				}
				else if ( faceVertexOrder[ 0 ] === 'c' ) {
					angle += Math.PI;
				}
				else if ( faceVertexOrder[ 0 ] === 'b' ) {
					angle -= Math.PI * 0.5;
				}
				//console.log( 'vertex order', faceVertexOrder );
				
			}
			else {
				
				// TODO: enable for Face3
				
			}
			
		}
		
		// modify object to account for sorting
		/*
		angle = angle / Math.max( 1, faces.length );
		console.log(' angle after sorting vertices ', angle, ' + degrees:', _MathHelper.rad_to_degree( angle ) );
		if ( angle !== 0 ) {
			
			var objectQ = object.quaternion,
				currentAxis = new THREE.Vector3( objectQ.x / Math.sqrt( 1 - objectQ.w * objectQ.w), objectQ.y / Math.sqrt( 1 - objectQ.w * objectQ.w ), objectQ.z / Math.sqrt( 1 - objectQ.w * objectQ.w ) ),
				vectors = _MathHelper.get_orthonormal_vectors( currentAxis );
				
			console.log(' current axis ', currentAxis, ' + vectors ', vectors.v2, vectors.v3 );
			sortRotOffset.setFromAxisAngle( currentAxis, angle );
			
			apply_quaternion( object, sortRotOffset, true );
			
		}
		*/
	}
	
	function get_vector_with_least_distance_to_source ( source, centroid ) {
		
		var i, l,
			source = arguments[ 0 ],
			dist,
			angle,
			angleMin = Number.MAX_VALUE,
			vector3,
			result;
		
		if ( source instanceof THREE.Vector3 ) {
			//console.log(' source', source.x.toFixed(4), source.y.toFixed(4), source.z.toFixed(4) );
			for ( i = 1, l = arguments.length; i < l; i++ ) {
				
				vector3 = arguments[ i ];
				
				if ( vector3 instanceof THREE.Vector3 ) {
					//console.log(' > vector3', vector3.x.toFixed(4), vector3.y.toFixed(4), vector3.z.toFixed(4) );
					dist = _MathHelper.clamp( vector3.dot( source ), -1, 1 );
					
					angle = Math.acos( dist );
					
					if ( Math.abs( angle ) < angleMin ) {
						
						angleMin = angle;
						
						result = vector3;
						
					}
					//console.log( ' > vert', i, ' dist to source', dist.toFixed(3), ' angle', angle.toFixed(3), 'angleMin? ', angleMin.toFixed(3) );
				}
				
			}
			
		}
		
		return result;
		
	}
	
	function correct_for_vertex_rotation ( object ) {
		
		var i, l,
			geometry = object instanceof THREE.Mesh ? object.geometry : object,
			faces = geometry.faces,
			vertices = geometry.vertices,
			face,
			epa = _ObjectHelper.expectedVertPosA,
			epb = _ObjectHelper.expectedVertPosB,
			epc = _ObjectHelper.expectedVertPosC,
			epd = _ObjectHelper.expectedVertPosD,
			vpa, vpb, vpc, vpd,
			npa = utilVec31Normalize,
			npb = utilVec32Normalize,
			npc = utilVec33Normalize,
			npd = utilVec34Normalize,
			vrotAvg = utilQ1Normalize,
			ca = shared.cardinalAxes,
			dist,
			angle = 0;
		
		// for all face normals
		
		for ( i = 0, l = faces.length; i < l; i++ ) {
			
			face = faces[ i ];
			
			vpa = vertices[ face.a ].position;
			vpb = vertices[ face.b ].position;
			vpc = vertices[ face.c ].position;
			
			npa.copy( vpa ).normalize();
			npb.copy( vpb ).normalize();
			npc.copy( vpc ).normalize();
			
			dist = _MathHelper.clamp( npa.dot( epa ), -1, 1 );
			angle += Math.acos( dist );
			dist = _MathHelper.clamp( npb.dot( epb ), -1, 1 );
			angle += Math.acos( dist );
			dist = _MathHelper.clamp( npc.dot( epc ), -1, 1 );
			angle += Math.acos( dist );
			
			if ( face instanceof THREE.Face4 ) {
				
				vpd = vertices[ face.d ].position;
				
				npd.copy( vpd ).normalize();
				
				dist = _MathHelper.clamp( npd.dot( epd ), -1, 1 );
				angle += Math.acos( dist );
				
			}
			
		}
	
		// normalize angle
		
		angle = angle / Math.max( 1, vertices.length );
		
		// apply
		
		vrotAvg.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), angle - Math.PI * 0.5 );
		
		apply_quaternion( object, vrotAvg, true, true );
		
		/*
		var vectors = _MathHelper.get_orthonormal_vectors( normalAvg.clone() ),
			xlg = new THREE.Geometry(),
			ylg = new THREE.Geometry(),
			zlg = new THREE.Geometry(),
			xline,
			yline,
			zline;
		
		offset.multiplyVector3( vectors.v1 );
		offset.multiplyVector3( vectors.v2 );
		offset.multiplyVector3( vectors.v3 );
		
		xlg.vertices.push( new THREE.Vertex( new THREE.Vector3() ) );
		xlg.vertices.push( new THREE.Vertex( vectors.v3.multiplyScalar( 100 ) ) );
		
		ylg.vertices.push( new THREE.Vertex( new THREE.Vector3() ) );
		ylg.vertices.push( new THREE.Vertex( vectors.v1.multiplyScalar( 100 ) ) );
		
		zlg.vertices.push( new THREE.Vertex( new THREE.Vector3() ) );
		zlg.vertices.push( new THREE.Vertex( vectors.v2.multiplyScalar( 100 ) ) );
		
		xline = new THREE.Line( xlg, new THREE.LineBasicMaterial( { color: 0xFF0000, linewidth: 8 } ), THREE.LinePieces ),
		yline = new THREE.Line( ylg, new THREE.LineBasicMaterial( { color: 0x00FF00, linewidth: 8 } ), THREE.LinePieces ),
		zline = new THREE.Line( zlg, new THREE.LineBasicMaterial( { color: 0x0000FF, linewidth: 8 } ), THREE.LinePieces );
		
		object.add( xline );
		object.add( yline );
		object.add( zline );
		*/
		
	}
	
	/*===================================================
    
    follow
    
    =====================================================*/
	
	function object_follow_object ( follower, leader, rotationBase, rotationOffset, positionOffset ) {
		
		var leaderScale = leader.scale,
			leaderScaleMax = Math.max( leaderScale.x, leaderScale.y, leaderScale.z ),
			leaderMatrixWorld = leader.matrixWorld,
			leaderQWorld = utilQ1Follow.setFromRotationMatrix( leaderMatrixWorld ),
			leaderPWorld = utilVec31Follow.copy( leaderMatrixWorld.getPosition() ),
			followerP = follower.position,
			followerQ = follower.quaternion,
			followerBaseRot = utilQ2Follow,
			followerOffsetRot = utilQ3Follow,
			followerOffsetPos = utilVec32Follow,
			parentInverseMatrix = utilMat41Follow,
			parentInverseQ = utilQ4Follow,
			skipBaseRot,
			skipOffsetRot,
			skipOffsetPos;
		
		// follower base rotation
		
		if ( rotationBase instanceof THREE.Quaternion ) {
			
			followerBaseRot.copy( rotationBase );
			
		}
		else if ( rotationBase instanceof THREE.Vector3 ) {
			
			followerBaseRot.setFromEuler( rotationBase ).normalize();
			
		}
		else {
			
			followerBaseRot.set( 0, 0, 0, 1 );
			
			skipBaseRot = true;
			
		}
		
		// follower offset rotation
		
		if ( rotationOffset instanceof THREE.Quaternion ) {
			
			followerOffsetRot.copy( rotationOffset );
			
		}
		else if ( rotationOffset instanceof THREE.Vector3 ) {
			
			followerOffsetRot.setFromEuler( rotationOffset ).normalize();
			
		}
		else {
			
			followerOffsetRot.set( 0, 0, 0, 1 );
			
			skipOffsetRot = true;
			
		}
		
		// follower offset position
		
		if ( positionOffset instanceof THREE.Vector3 ) {
		
			followerOffsetPos.set( positionOffset.x, positionOffset.y, positionOffset.z ).multiplyScalar( leaderScaleMax );
			
		}
		else {
			
			skipOffsetPos = true;
			
		}
		
		// modify offset position
		
		if ( skipOffsetPos !== true ) {
			
			if ( skipBaseRot !== true ) {
				
				followerBaseRot.multiplyVector3( followerOffsetPos );
				
			}
			
			if ( skipOffsetRot !== true ) {
				
				followerOffsetRot.multiplyVector3( followerOffsetPos );
				
			}
			
			if ( follower.parent !== leader ) {
				
				leaderQWorld.multiplyVector3( followerOffsetPos );
				
			}
			
		}
		
		// if parents are not the same
		
		if ( follower.parent instanceof THREE.Object3D && follower.parent !== leader && follower.parent !== leader.parent ) {
			
			// get inverse position and rotation
			
			parentInverseMatrix.getInverse( follower.parent.matrixWorld );
			parentInverseQ.setFromRotationMatrix( parentInverseMatrix );
			
			// modify offset position and leader world position
			// to account for follower being affected by parent matrix
			
			if ( skipOffsetPos !== true ) {
				
				parentInverseQ.multiplyVector3( followerOffsetPos );
				
			}
			
			parentInverseQ.multiplyVector3( leaderPWorld );
			
			// copy inverse as base
			
			followerP.copy( parentInverseMatrix.getPosition() );
			followerQ.copy( parentInverseQ );
			
		}
		// reset pos / rot
		else {
			
			followerP.set( 0, 0, 0 );
			followerQ.set( 0, 0, 0, 1 );
			
		}
		
		// position
		
		if ( follower.parent !== leader ) {
			
			followerP.addSelf( leaderPWorld );
			
		}
		
		if ( skipOffsetPos !== true ) {
			
			followerP.addSelf( followerOffsetPos );
			
		}
		
		// rotation
		
		if ( follower.parent !== leader ) {
			
			followerQ.multiplySelf( leaderQWorld );
			
		}
		
		if ( skipOffsetRot !== true ) {
			
			followerQ.multiplySelf( followerOffsetRot );
			
		}
		
		if ( skipBaseRot !== true ) {
			
			followerQ.multiplySelf( followerBaseRot );
			
		}
		
	}
    
} ( KAIOPUA ) );